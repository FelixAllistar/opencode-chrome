import { streamText, convertToModelMessages, stepCountIs, readUIMessageStream } from 'ai';
import { getProvider } from './providers.js';
import { getTools } from './tools.js';




export const generateResponse = async (modelId, type, messages, apiKey, options = {}) => {
  console.log('🔍 [generateResponse] Starting stream generation');
  console.log('📋 [generateResponse] Model:', modelId, 'Type:', type);
  console.log('📝 [generateResponse] Messages count:', messages.length);
  console.log('🔑 [generateResponse] API key (first 4):', apiKey?.substring(0, 4) + '...');
  console.log('⚙️ [generateResponse] Options:', {
    enableTools: options.enableTools,
    hasSystem: !!options.system,
    hasAbortSignal: !!options.abortSignal
  });

  // Validate API key
  if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 10) {
    const error = new Error('Invalid API key format or missing API key');
    console.error('❌ [generateResponse] API key validation failed:', error.message);
    throw error;
  }

  const model = getProvider(modelId, type, apiKey);
  const tools = options.enableTools ? getTools() : undefined;

  console.log('🛠️ [generateResponse] Tools available:', tools ? Object.keys(tools).length : 0);

  const stepData = [];
  let finalText = '';
  let streamError = null;

  try {
    console.log('🚀 [generateResponse] Calling streamText...');

    // Create and await the streamText result properly
    const result = await streamText({
      model,
      messages: convertToModelMessages(messages),
      tools,
      // Enable multi-step calls when tools are available
      ...(tools && {
        stopWhen: stepCountIs(10), // Allow up to 10 steps in tool conversations
        maxToolRoundtrips: 2, // Allow up to 2 tool call roundtrips per message
      }),
      ...(options.system && { system: options.system }),
      ...(options.temperature && { temperature: options.temperature }),
      ...(options.maxTokens && { maxTokens: options.maxTokens }),
      ...(options.abortSignal && { abortSignal: options.abortSignal }),
      // Handle each step completion including tool calls
      onStepFinish: (result) => {
        console.log('📊 [generateResponse] Step completed:', result.stepType);
        // Transform step data into chain-of-thought format
        const chainOfThoughtStep = {
          stepType: result.stepType,
          finishReason: result.finishReason,
          text: result.text,
          toolCalls: result.toolCalls || [],
          toolResults: result.toolResults || [],
          usage: result.usage
        };
        stepData.push(chainOfThoughtStep);
      },
      // Handle final completion
      onFinish: ({ text, toolCalls, toolResults, finishReason, usage, steps }) => {
        console.log('✅ [generateResponse] Stream finished successfully');
        finalText = text || '';
      },
      // Handle errors during streaming
      onError: ({ error }) => {
        console.error('❌ [generateResponse] Streaming error:', error);
        streamError = error; // Store the error to yield later
      },
    });

    console.log('🎯 [generateResponse] streamText completed, creating result object');
    console.log('🔍 [generateResponse] Result object keys:', Object.keys(result));
    console.log('🔍 [generateResponse] Result types:', {
      hasTextStream: !!result.textStream,
      hasFullStream: !!result.fullStream,
      hasToDataStream: !!result.toDataStream,
      hasToDataStreamResponse: !!result.toDataStreamResponse,
      hasToUIMessageStreamResponse: !!result.toUIMessageStreamResponse,
      hasToUIMessageStream: !!result.toUIMessageStream
    });

    // Create a new result object to avoid spreading issues
    const resultWithHelpers = {
      textStream: result.textStream, // Explicitly preserve textStream
      fullStream: result.fullStream,
      toDataStream: result.toDataStream,
      toDataStreamResponse: result.toDataStreamResponse,
      toUIMessageStreamResponse: result.toUIMessageStreamResponse,
      toUIMessageStream: result.toUIMessageStream,
      finishReason: result.finishReason,
      usage: result.usage,
      warnings: result.warnings,
      requests: result.requests,
      // Add helper methods
      getStepData: () => {
        return stepData;
      },
      consumeUIMessageStream: async function* () {
        console.log('🌊 [generateResponse] Starting consumeUIMessageStream');

        try {
          const uiStream = result.toUIMessageStream();
          console.log('🔍 [generateResponse] Got UI message stream:', uiStream);
          console.log('🔍 [generateResponse] UI stream type:', typeof uiStream);
          console.log('🔍 [generateResponse] UI stream constructor:', uiStream?.constructor?.name);

          yield* readUIMessageStream({
            stream: uiStream,
          });
          console.log('✅ [generateResponse] readUIMessageStream completed successfully');
        } catch (streamError) {
          console.error('❌ [generateResponse] Error in readUIMessageStream:', streamError);
          throw streamError;
        }

        if (streamError) {
          console.log('⚠️ [generateResponse] Yielding stored stream error');
          yield { type: 'error', error: streamError };
        }
      }
    };

    return resultWithHelpers;

  } catch (error) {
    console.error('💥 Error in generateResponse:', error);
    throw error;
  }
};