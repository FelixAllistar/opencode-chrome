import { tool } from 'ai';
import { z } from 'zod';

export const analyzeCodeToolDefinition = (() => {
  const toolInstance = tool({
    description: 'Analyze code currently visible in the browser tab',
    inputSchema: z.object({
      elementType: z.enum(['function', 'class', 'variable', 'all']).optional().default('all').describe('Type of code element to focus on'),
      language: z.string().optional().describe('Programming language to analyze'),
    }),
    execute: async ({ elementType, language }) => {
      console.log('Code analysis requested:', { elementType, language });

      return {
        analysis: 'Code analysis placeholder - implement content script communication',
        elementType,
        language,
        timestamp: new Date().toISOString(),
      };
    },
  });

  return {
    id: 'analyzeCode',
    label: 'Analyze Code',
    description: 'Analyze code currently visible in the browser tab',
    defaultEnabled: true,
    tool: toolInstance,
  };
})();

export const analyzeCodeTool = analyzeCodeToolDefinition.tool;
