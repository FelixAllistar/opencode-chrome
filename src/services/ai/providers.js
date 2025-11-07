import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export const getProvider = (modelId, type, apiKey) => {
  try {
    // Use OpenAI-compatible provider for all models since OpenCode Zen uses consistent API
    const provider = createOpenAICompatible({ baseURL: 'https://opencode.ai/zen/v1', apiKey });
    const model = provider(modelId);
    return model;
  } catch (error) {
    throw error;
  }
};