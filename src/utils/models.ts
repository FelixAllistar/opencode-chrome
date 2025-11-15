import type { ModelConfig, ProviderApiKeys } from '@/types/index.ts';
import { MODELS } from '@/utils/constants.js';

export const ALL_MODELS = MODELS as unknown as ModelConfig[];

export const isVisionModel = (model: ModelConfig | undefined | null): boolean => {
  if (!model) {
    return true;
  }
  return Boolean(model.isVision);
};

export const supportsTools = (model: ModelConfig | undefined | null): boolean => {
  if (!model) {
    return true;
  }
  return Boolean(model.supportsTools);
};

export const getProviderLabel = (model: ModelConfig | undefined | null): string => {
  if (!model) {
    return 'selected model';
  }
  return model.name || model.type || 'selected model';
};

export const getRequiredApiKey = (
  model: ModelConfig | undefined | null,
  keys: ProviderApiKeys
): string | null => {
  if (!model) {
    return null;
  }

  switch (model.type) {
    case 'google':
      return keys.google ?? null;
    case 'anthropic':
      return keys.anthropic ?? null;
    case 'openrouter':
      return keys.openRouter ?? null;
    case 'openai':
      return keys.openai ?? null;
    case 'openai-compatible':
    default:
      return keys.openCode ?? null;
  }
};

export const hasAnyProviderKey = (keys: ProviderApiKeys): boolean => {
  return Boolean(
    keys.openCode ||
      keys.google ||
      keys.openRouter ||
      keys.anthropic ||
      keys.openai
  );
};

