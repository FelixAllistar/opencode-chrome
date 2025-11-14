import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const normalizeApiKeys = (apiKeys) => {
  if (!apiKeys) {
    return { openCode: '', google: '', openRouter: '', anthropic: '', openai: '' };
  }

  if (typeof apiKeys === 'string') {
    return { openCode: apiKeys, google: '', openRouter: '', anthropic: '', openai: '' };
  }

  return {
    openCode: apiKeys.openCode ?? apiKeys.apiKey ?? apiKeys.zen ?? '',
    google: apiKeys.google ?? '',
    openRouter: apiKeys.openRouterApiKey ?? apiKeys.openRouter ?? '',
    anthropic: apiKeys.anthropic ?? apiKeys.anthropicApiKey ?? '',
    openai: apiKeys.openai ?? apiKeys.openaiApiKey ?? ''
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

    if (type === 'anthropic') {
      if (!keys.anthropic) {
        throw new Error('An Anthropic API key is required to use Claude models.');
      }

      const anthropicProvider = createAnthropic({
        apiKey: keys.anthropic,
        headers: {
          'anthropic-dangerous-direct-browser-access': '1'
        }
      });
      return anthropicProvider(modelId);
    }

    if (type === 'openai') {
      if (!keys.openai) {
        throw new Error('An OpenAI API key is required to use OpenAI models.');
      }

      const openAIProvider = createOpenAI({ apiKey: keys.openai });
      return openAIProvider(modelId);
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
