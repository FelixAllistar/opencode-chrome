import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export const getProvider = (modelId, type, apiKey) => {
  console.log('🔧 [providers] Creating OpenAI-compatible provider');
  console.log('🔧 [providers] Model ID:', modelId);
  console.log('🔧 [providers] Type:', type);
  console.log('🔧 [providers] API key (first 4):', apiKey?.substring(0, 4) + '...');
  console.log('🔧 [providers] Base URL: https://opencode.ai/zen/v1');

  try {
    // Use OpenAI-compatible provider for all models since OpenCode Zen uses consistent API
    const provider = createOpenAICompatible({ baseURL: 'https://opencode.ai/zen/v1', apiKey });
    console.log('✅ [providers] Provider created successfully');
    console.log('🔧 [providers] Provider type:', typeof provider);

    const model = provider(modelId);
    console.log('✅ [providers] Model created successfully');
    console.log('🔧 [providers] Model:', model);

    return model;
  } catch (error) {
    console.error('❌ [providers] Error creating provider:', error);
    throw error;
  }
};