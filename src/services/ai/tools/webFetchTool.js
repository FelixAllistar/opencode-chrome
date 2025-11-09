import { tool } from 'ai';
import { z } from 'zod';

export const webFetchToolDefinition = (() => {
  const toolInstance = tool({
    description: 'Fetch content from a URL and analyze it',
    inputSchema: z.object({
      url: z.string().describe('The URL to fetch content from'),
    }),
    execute: async ({ url }) => {
      console.log('Web fetch requested:', { url });

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const content = await response.text();
        const maxContentLength = 2000;
        const truncatedContent = content.length > maxContentLength
          ? content.substring(0, maxContentLength) + '... (content truncated)'
          : content;

        return {
          url,
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type') || 'unknown',
          contentLength: content.length,
          content: truncatedContent,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return {
          url,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        };
      }
    },
  });

  return {
    id: 'webFetch',
    label: 'Web Fetch',
    description: 'Fetch content from a URL and analyze it',
    defaultEnabled: true,
    tool: toolInstance,
  };
})();

export const webFetchTool = webFetchToolDefinition.tool;
