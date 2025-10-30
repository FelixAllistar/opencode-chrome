import { streamText, convertToModelMessages, stepCountIs } from 'ai';
import { getProvider } from './providers.js';
import { getTools } from './tools.js';

export const generateResponse = async (modelId, type, messages, apiKey, options = {}) => {
  const model = getProvider(modelId, type, apiKey);
  const tools = options.enableTools ? getTools() : undefined;

  const result = streamText({
    model,
    messages: convertToModelMessages(messages),
    tools,
    // Enable multi-step calls when tools are available
    ...(tools && {
      stopWhen: stepCountIs(10), // Allow up to 10 steps in tool conversations
      maxToolRoundtrips: 2, // Allow up to 2 tool call roundtrips per message
    }),
    ...(options.system && { system: options.system }),
    ...(options.temperature && { temperature: options.temperature }),
    ...(options.maxTokens && { maxTokens: options.maxTokens }),
  });

  return result;
};