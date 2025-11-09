import { tool } from 'ai';
import { z } from 'zod';

export const getDocumentationToolDefinition = (() => {
  const toolInstance = tool({
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

  return {
    id: 'getDocumentation',
    label: 'Documentation Lookup',
    description: 'Get explanations or documentation for programming concepts',
    defaultEnabled: true,
    tool: toolInstance,
  };
})();

export const getDocumentationTool = getDocumentationToolDefinition.tool;
