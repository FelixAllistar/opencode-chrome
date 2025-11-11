import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const normalizeApiKeys = (apiKeys) => {
  if (!apiKeys) {
    return { openCode: '', google: '', openRouter: '' };
  }

  if (typeof apiKeys === 'string') {
    return { openCode: apiKeys, google: '', openRouter: '' };
  }

  return {
    openCode: apiKeys.openCode ?? apiKeys.apiKey ?? apiKeys.zen ?? '',
    google: apiKeys.google ?? '',
    openRouter: apiKeys.openRouterApiKey ?? apiKeys.openRouter ?? ''
  };
};

export const getProvider = (modelId, type, apiKeys) => {
  const keys = normalizeApiKeys(apiKeys);

  try {
    if (type === 'openrouter') {
      if (!keys.openRouter) {
        throw new Error('An OpenRouter API key is required to use OpenRouter models.');
      }

      const openRouterProvider = createOpenRouter({ apiKey: keys.openRouter });
      return openRouterProvider(modelId);
    }

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
