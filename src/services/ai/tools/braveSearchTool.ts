import { tool } from 'ai';
import { z } from 'zod';
import type { ToolDefinition } from './types';

type BraveSearchRuntimeContext = {
  getToken: () => string | undefined;
};

const BRAVE_SEARCH_BASE_URL = 'https://api.search.brave.com/res/v1/web/search';
const MAX_SECTION_ENTRIES = 6;

type BraveSearchInput = {
  query: string;
  count?: number;
  summary?: boolean;
  country?: string;
  searchLang?: string;
  spellcheck?: boolean;
  safesearch?: 'off' | 'moderate' | 'strict';
};

type BraveSearchResultEntry = {
  title: string;
  snippet: string;
  url: string;
  position: number;
  meta?: Record<string, unknown>;
};

type BraveSearchSection = {
  id: string;
  label: string;
  description?: string;
  entries: BraveSearchResultEntry[];
};

type BraveSearchOutput = {
  query: string;
  requestedCount: number;
  summaryRequested: boolean;
  summary: string | null;
  sections: BraveSearchSection[];
  fetchedAt: string;
  apiResponseType?: string;
  rawResponse: unknown;
};

const simplifyResultEntry = (item: Record<string, unknown>, fallbackPosition: number): BraveSearchResultEntry => {
  const title =
    (typeof item.title === 'string' && item.title) ||
    (typeof item.label === 'string' && item.label) ||
    (typeof item.heading === 'string' && item.heading) ||
    `Result ${fallbackPosition}`;
  const snippet =
    (typeof item.description === 'string' && item.description) ||
    (typeof item.snippet === 'string' && item.snippet) ||
    (typeof item.summary === 'string' && item.summary) ||
    '';
  const url =
    (typeof item.url === 'string' && item.url) ||
    (typeof item.link === 'string' && item.link) ||
    (typeof item.webUrl === 'string' && item.webUrl) ||
    '';

  return {
    title,
    snippet,
    url,
    position: fallbackPosition,
    meta: {
      source: typeof item.source === 'string' ? item.source : undefined,
      language: typeof item.language === 'string' ? item.language : undefined,
      isSourceLocal: Boolean(item.is_source_local),
    },
  };
};

const collectEntries = (value: unknown, displayLimit: number): BraveSearchResultEntry[] => {
  if (!value) {
    return [];
  }

  const arraySource = Array.isArray(value)
    ? value
    : Array.isArray((value as Record<string, unknown>).results)
      ? (value as Record<string, unknown>).results
      : Array.isArray((value as Record<string, unknown>).items)
        ? (value as Record<string, unknown>).items
        : undefined;

  if (!Array.isArray(arraySource)) {
    return [];
  }

  return arraySource.slice(0, displayLimit).map((entry, index) =>
    simplifyResultEntry(
      typeof entry === 'object' && entry !== null ? (entry as Record<string, unknown>) : {},
      index + 1
    )
  );
};

const buildSection = (id: string, label: string, payload: unknown, displayLimit: number): BraveSearchSection | null => {
  const entries = collectEntries(payload, displayLimit);
  if (entries.length === 0) {
    return null;
  }

  return {
    id,
    label,
    entries,
  };
};

export const createBraveSearchTool = (ctx: BraveSearchRuntimeContext) =>
  tool({
  description: 'Run a Brave Web Search query and return structured web/news/mixed results',
  inputSchema: z.object({
    query: z.string().min(1).describe('The search query to send to Brave Search'),
    count: z
      .number()
      .int()
      .min(1)
      .max(20)
      .default(5)
      .describe('How many results to return (Brave caps at 20)'),
    summary: z.boolean().default(false).describe('Request Brave Search to include its summary section'),
    country: z.string().optional().describe('Country code override (e.g., US, GB, CA)'),
    searchLang: z.string().optional().describe('Search language override (e.g., en, de, ja)'),
    spellcheck: z.boolean().default(false).describe('Enable Brave spellcheck for the query'),
    safesearch: z.enum(['off', 'moderate', 'strict']).optional().describe('Safe search level'),
  }),
  execute: async ({
    query,
    count,
    summary,
    country,
    searchLang,
    spellcheck,
    safesearch,
  }: BraveSearchInput) => {
    const braveSearchSubscriptionToken = ctx.getToken()?.trim();
    if (!braveSearchSubscriptionToken) {
      throw new Error('Missing Brave Search API key; please add it via the settings menu.');
    }

    const validatedCount = Math.min(Math.max(count ?? 5, 1), 20);
    const displayLimit = Math.min(validatedCount, MAX_SECTION_ENTRIES);

    const params = new URLSearchParams();
    params.set('q', query);
    params.set('count', validatedCount.toString());
    params.set('summary', summary ? '1' : '0');
    params.set('spellcheck', spellcheck ? '1' : '0');
    if (country) {
      params.set('country', country.toLowerCase());
    }
    if (searchLang) {
      params.set('search_lang', searchLang.toLowerCase());
    }
    if (safesearch) {
      params.set('safesearch', safesearch);
    }

    const requestUrl = `${BRAVE_SEARCH_BASE_URL}?${params.toString()}`;

    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
        'X-Subscription-Token': braveSearchSubscriptionToken,
      },
    });

    const payload = await response.json().catch(() => ({}));
    const responsePayload = payload as Record<string, unknown>;

    if (!response.ok) {
      const message =
        typeof payload === 'object' && payload && 'message' in payload
          ? String((payload as Record<string, unknown>).message)
          : response.statusText;
      throw new Error(`Brave Search API error (${response.status}): ${message}`);
    }

    const sections: BraveSearchSection[] = [];
    const maybeAdd = (id: string, label: string, data: unknown) => {
      const section = buildSection(id, label, data, displayLimit);
      if (section) {
        sections.push(section);
      }
    };

    maybeAdd('web', 'Web Results', responsePayload.web);
    maybeAdd('news', 'News', responsePayload.news);
    maybeAdd('mixed', 'Mixed Results', responsePayload.mixed);
    maybeAdd('discussions', 'Discussions', responsePayload.discussions);
    maybeAdd('faq', 'FAQs', responsePayload.faq);
    maybeAdd('locations', 'Location Results', responsePayload.locations);
    maybeAdd('videos', 'Video Results', responsePayload.videos);

    if (responsePayload.infobox && typeof responsePayload.infobox === 'object') {
      const infobox = responsePayload.infobox as Record<string, unknown>;
      sections.push({
        id: 'infobox',
        label: 'Infobox',
        entries: [
          {
            title:
              (typeof infobox.label === 'string' && infobox.label) ||
              (typeof infobox.name === 'string' && infobox.name) ||
              'Infobox entry',
            snippet:
              (typeof infobox.long_desc === 'string' && infobox.long_desc) ||
              (typeof infobox.description === 'string' && infobox.description) ||
              '',
            url: (typeof infobox.website_url === 'string' && infobox.website_url) || '',
            position: 1,
            meta: {
              category: typeof infobox.category === 'string' ? infobox.category : undefined,
            },
          },
        ],
      });
    }

    const summarizerSection = responsePayload.summarizer as Record<string, unknown> | undefined;
    const summaryText =
      summarizerSection && typeof summarizerSection.text === 'string' && summarizerSection.text.trim().length > 0
        ? summarizerSection.text.trim()
        : null;

    return {
      query,
      requestedCount: validatedCount,
      summaryRequested: summary,
      summary: summaryText,
      sections,
      apiResponseType: typeof responsePayload.type === 'string' ? responsePayload.type : undefined,
      fetchedAt: new Date().toISOString(),
      rawResponse: payload,
    };
  },
  });

const defaultBraveSearchToolInstance = createBraveSearchTool({
  getToken: () => '',
});

export const braveSearchToolDefinition: ToolDefinition = {
  id: 'braveSearch',
  label: 'Brave Search',
  description: 'Use Brave Search to surface web/news/mixed results with optional summary',
  defaultEnabled: false,
  tool: defaultBraveSearchToolInstance,
};
