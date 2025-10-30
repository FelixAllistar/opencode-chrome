import { tool } from 'ai';
import { z } from 'zod';

/**
 * Tools available to the AI assistant in the OpenCode browser extension
 * These tools allow the AI to perform web searches and execute code
 */

/**
 * Fetch and analyze content from a URL
 */
export const webFetchTool = tool({
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

      // Truncate content if too long for display
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
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },
});

/**
 * Analyze code on the current page
 */
export const analyzeCodeTool = tool({
  description: 'Analyze code currently visible in the browser tab',
  inputSchema: z.object({
    elementType: z.enum(['function', 'class', 'variable', 'all']).optional().default('all').describe('Type of code element to focus on'),
    language: z.string().optional().describe('Programming language to analyze'),
  }),
  execute: async ({ elementType, language }) => {
    // This would interact with the content script to analyze page code
    console.log('Code analysis requested:', { elementType, language });

    return {
      analysis: 'Code analysis placeholder - implement content script communication',
      elementType,
      language,
      timestamp: new Date().toISOString(),
    };
  },
});

/**
 * Get documentation for a programming concept
 */
export const getDocumentationTool = tool({
  description: 'Get documentation or explanations for programming concepts, functions, or libraries',
  inputSchema: z.object({
    concept: z.string().describe('The programming concept, function, or library to document'),
    language: z.string().optional().describe('The programming language context'),
  }),
  execute: async ({ concept, language }) => {
    console.log('Documentation requested:', { concept, language });

    return {
      concept,
      language,
      documentation: `Documentation placeholder for ${concept} in ${language || 'general'}`,
      examples: [
        `// Example usage of ${concept}`,
        `${concept}(); // placeholder implementation`,
      ],
      timestamp: new Date().toISOString(),
    };
  },
});

/**
 * Export all available tools
 */
export const tools = {
  webFetch: webFetchTool,
  analyzeCode: analyzeCodeTool,
  getDocumentation: getDocumentationTool,
};

/**
 * Get tools object for AI SDK consumption
 */
export function getTools() {
  return tools;
}