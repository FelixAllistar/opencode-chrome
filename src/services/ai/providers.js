import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const normalizeApiKeys = (apiKeys) => {
  if (!apiKeys) {
    return { openCode: '', google: '' };
  }

  if (typeof apiKeys === 'string') {
    return { openCode: apiKeys, google: '' };
  }

  return {
    openCode: apiKeys.openCode ?? apiKeys.apiKey ?? apiKeys.zen ?? '',
    google: apiKeys.google ?? ''
  };
};

export const getProvider = (modelId, type, apiKeys) => {
  const keys = normalizeApiKeys(apiKeys);

  try {
    if (type === 'google') {
      if (!keys.google) {
        throw new Error('A Google API key is required to use Gemini models.');
      }

      const provider = createGoogleGenerativeAI({ apiKey: keys.google });
      return provider(modelId);
    }

    const provider = createOpenAICompatible({
      baseURL: 'https://opencode.ai/zen/v1',
      apiKey: keys.openCode
    });
    return provider(modelId);
  } catch (error) {
    throw error;
  }
};
