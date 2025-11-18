// Provider types used across the app; keep in sync with ProviderType in src/types/index.ts.
export const PROVIDER_TYPES = ['openai', 'anthropic', 'openai-compatible', 'google', 'openrouter'];
export const PROVIDER_LABELS = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  'openai-compatible': 'OpenCode Zen',
  google: 'Gemini',
  openrouter: 'OpenRouter'
};

/**
 * Default model catalog.
 * This array is treated as `ModelConfig[]` (see src/types/index.ts) by the TypeScript helpers.
 */
export const MODELS = [
  { id: 'gpt-5', name: 'GPT 5', type: 'openai', isVision: true, supportsTools: true },
  { id: 'gpt-5-codex', name: 'GPT 5 Codex', type: 'openai', isVision: true, supportsTools: true },
  { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5', type: 'anthropic', isVision: true, supportsTools: true },
  { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', type: 'anthropic', isVision: true, supportsTools: true },
  { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', type: 'anthropic', isVision: true, supportsTools: true },
  { id: 'claude-3-5-haiku', name: 'Claude Haiku 3.5', type: 'anthropic', isVision: true, supportsTools: true },
  { id: 'claude-opus-4-1', name: 'Claude Opus 4.1', type: 'anthropic', isVision: true, supportsTools: true },
  { id: 'qwen3-coder', name: 'Qwen3 Coder 480B', type: 'openai-compatible', isVision: true, supportsTools: true },
  { id: 'grok-code', name: 'Grok Code Fast 1', type: 'openai-compatible', isVision: false, supportsTools: true },
  { id: 'kimi-k2', name: 'Kimi K2', type: 'openai-compatible', isVision: true, supportsTools: true },
  { id: 'big-pickle', name: 'Big Pickle', type: 'openai-compatible', isVision: false, supportsTools: true },
  { id: 'error-test', name: 'Error Test Model', type: 'openai-compatible', isVision: true, supportsTools: true },
  { id: 'gemini-2.5-flash-image', name: 'Nano Banana (Paid Only)', type: 'google', isVision: true, supportsTools: true },
  { id: 'gemini-flash-latest', name: 'Flash', type: 'google', isVision: true, supportsTools: true },
  { id: 'gemini-flash-lite-latest', name: 'Flash Lite', type: 'google', isVision: true, supportsTools: true },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', type: 'google', isVision: true, supportsTools: true },
  { id: 'openrouter/polaris-alpha', name: 'Polaris Alpha', type: 'openrouter', isVision: true, supportsTools: true },
  { id: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free', name: 'Venice', type: 'openrouter', isVision: false, supportsTools: false }
];

export const DEFAULT_ENABLED_MODEL_IDS = MODELS.map((model) => model.id);

export const DEFAULT_MODEL_PREFERENCES = {
  enabledModelIds: DEFAULT_ENABLED_MODEL_IDS,
  customModels: []
};
