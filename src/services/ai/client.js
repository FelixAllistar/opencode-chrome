import { streamText } from 'ai';
import { getProvider } from './providers.js';

export const generateResponse = async (modelId, type, input, apiKey) => {
  const model = getProvider(modelId, type, apiKey);
  const result = streamText({
    model,
    prompt: input,
  });

  return result;
};