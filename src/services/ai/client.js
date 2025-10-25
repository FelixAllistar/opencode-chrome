import { streamText, convertToModelMessages } from 'ai';
import { getProvider } from './providers.js';

export const generateResponse = async (modelId, type, messages, apiKey) => {
  const model = getProvider(modelId, type, apiKey);
  const result = streamText({
    model,
    messages: convertToModelMessages(messages),
  });

  return result;
};