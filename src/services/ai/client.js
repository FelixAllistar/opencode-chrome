import { streamText, convertToModelMessages, stepCountIs } from 'ai';
import { getProvider } from './providers.js';
import { getTools } from './tools.js';

export const generateResponse = async (modelId, type, messages, apiKey, options = {}) => {
  console.log('🤖 generateResponse called with:', { modelId, type, messagesLength: messages?.length, hasApiKey: !!apiKey, options });

  const model = getProvider(modelId, type, apiKey);
  const tools = options.enableTools ? getTools() : undefined;

  console.log('🔧 Model and tools setup:', { hasModel: !!model, toolsCount: tools ? Object.keys(tools).length : 0 });

  const stepData = [];
  let finalText = '';

  try {
    console.log('📡 Calling streamText...');

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
      // Handle each step completion including tool calls
      onStepFinish: (result) => {
        console.log('🏁 Step finished - Result:', result);

        // Capture step data for UI rendering
        stepData.push({
          stepType: result.stepType,
          finishReason: result.finishReason,
          text: result.text,
          toolCalls: result.toolCalls || [],
          toolResults: result.toolResults || [],
          usage: result.usage
        });
      },
      // Handle final completion
      onFinish: ({ text, toolCalls, toolResults, finishReason, usage, steps }) => {
        console.log('🏁 Stream finished - Text:', text);
        console.log('🏁 Stream finished - Tool calls:', toolCalls);
        console.log('🏁 Stream finished - Tool results:', toolResults);
        console.log('🏁 Stream finished - Steps:', steps);
        console.log('🏁 Stream finished - Usage:', usage);

        finalText = text || '';
      },
    });

    console.log('✅ streamText completed, result keys:', Object.keys(result));
    console.log('✅ Has textStream?', !!result.textStream);
    console.log('✅ Step data collected:', stepData.length, 'steps');

    // Check if textStream is a function or iterable
    console.log('🔍 textStream type:', typeof result.textStream);
    console.log('🔍 textStream constructor:', result.textStream?.constructor?.name);

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
        console.log('📊 getStepData called, returning:', stepData);
        return stepData;
      },
      getFinalText: () => {
        console.log('📝 getFinalText called, returning:', finalText);
        return finalText;
      }
    };

    console.log('🎯 Returning result with helpers, has textStream:', !!resultWithHelpers.textStream);
    return resultWithHelpers;

  } catch (error) {
    console.error('💥 Error in generateResponse:', error);
    throw error;
  }
};