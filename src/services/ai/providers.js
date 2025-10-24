import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export const getProvider = (modelId, type, apiKey) => {
  if (type === 'openai') {
    return openai(modelId, { apiKey, baseURL: 'https://opencode.ai/zen/v1' });
  } else if (type === 'anthropic') {
    return anthropic(modelId, { apiKey, baseURL: 'https://opencode.ai/zen/v1' });
  } else if (type === 'openai-compatible') {
    const provider = createOpenAICompatible({ baseURL: 'https://opencode.ai/zen/v1', apiKey });
    return provider(modelId);
  }
  throw new Error(`Unsupported provider type: ${type}`);
};