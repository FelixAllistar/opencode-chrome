import { tool } from 'ai';
import { z } from 'zod';
import type { ToolDefinition } from './types';

const CONTEXT7_API_BASE = 'https://context7.com/api/v1';
const CONTEXT7_SEARCH_ENDPOINT = `${CONTEXT7_API_BASE}/search`;
const MAX_DOC_PREVIEW = 4000;

let context7ApiKey = '';

export function setContext7ApiKey(token?: string) {
  context7ApiKey = token?.trim() ?? '';
}

type Context7SearchResult = {
  id?: string;
  title?: string;
  description?: string;
  trustScore?: number;
  versions?: unknown[];
};

type Context7Input = {
  query: string;
  topic?: string;
  tokens?: number;
};

type Context7Output = {
  query: string;
  topic?: string;
  libraryId: string;
  libraryTitle?: string;
  libraryDescription?: string;
  versions?: string[];
  trustScore?: number;
  documentation: string;
  sourceUrl: string;
  fetchedAt: string;
};

const context7ToolInstance = tool({
  description: 'Look up Context7 documentation for libraries or hooks',
  inputSchema: z.object({
    query: z.string().min(1).describe('The search query that describes the library or hook you need'),
    topic: z.string().optional().describe('Optional topic to focus the documentation request'),
    tokens: z
      .number()
      .int()
      .min(500)
      .max(5000)
      .default(3000)
      .describe('How much Context7 documentation to request (tokens)'),
  }),
  execute: async ({ query, topic, tokens }: Context7Input): Promise<Context7Output> => {
    if (!context7ApiKey) {
      throw new Error('Missing Context7 API key; please add it via the settings menu.');
    }

    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      throw new Error('Context7 query cannot be empty.');
    }

    const searchUrl = new URL(CONTEXT7_SEARCH_ENDPOINT);
    searchUrl.searchParams.set('query', normalizedQuery);

    const searchResponse = await fetch(searchUrl.toString(), {
      headers: {
        Authorization: `Bearer ${context7ApiKey}`,
      },
    });

    if (!searchResponse.ok) {
      throw new Error(`Context7 search failed (${searchResponse.status}): ${searchResponse.statusText}`);
    }

    const searchPayload = (await searchResponse.json()) as { results?: Context7SearchResult[] };
    const searchResult = Array.isArray(searchPayload?.results)
      ? searchPayload.results.find((item) => typeof item?.id === 'string' && item.id.endsWith('/documentation'))
        ?? searchPayload.results[0]
      : undefined;

    if (!searchResult || !searchResult.id) {
      throw new Error('Context7 search returned no documentation entries.');
    }

    const libraryPath = searchResult.id.replace(/\/documentation$/, '').replace(/^\//, '');
    if (!libraryPath) {
      throw new Error('Context7 search result path was invalid.');
    }

    const docsUrl = new URL(`${CONTEXT7_API_BASE}/${libraryPath}`);
    docsUrl.searchParams.set('type', 'txt');
    docsUrl.searchParams.set('tokens', String(tokens));

    const topicValue = (topic || normalizedQuery).trim();
    if (topicValue) {
      docsUrl.searchParams.set('topic', topicValue);
    }

    const docsResponse = await fetch(docsUrl.toString(), {
      headers: {
        Authorization: `Bearer ${context7ApiKey}`,
      },
    });

    if (!docsResponse.ok) {
      throw new Error(`Context7 documentation fetch failed (${docsResponse.status}): ${docsResponse.statusText}`);
    }

    const documentationText = await docsResponse.text();
    const truncatedDocumentation =
      documentationText.length > MAX_DOC_PREVIEW
        ? `${documentationText.slice(0, MAX_DOC_PREVIEW)}...\n\n(documentation truncated)`
        : documentationText;

    const sourceUrl = `https://context7.com/${libraryPath}`;

    return {
      query: normalizedQuery,
      topic: topicValue || undefined,
      libraryId: searchResult.id,
      libraryTitle: searchResult.title,
      libraryDescription: searchResult.description,
      versions: Array.isArray(searchResult.versions)
        ? searchResult.versions.map((value) => String(value))
        : undefined,
      trustScore: searchResult.trustScore,
      documentation: truncatedDocumentation,
      sourceUrl,
      fetchedAt: new Date().toISOString(),
    };
  },
});

export const context7ToolDefinition: ToolDefinition = {
  id: 'context7Docs',
  label: 'Context7 Docs',
  description: 'Look up Context7 documentation snippets for a library or hook',
  defaultEnabled: false,
  tool: context7ToolInstance,
};
