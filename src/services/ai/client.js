import { getProvider } from './providers.js';
import { getTools } from './tools.js';
import {
  streamText,
  convertToModelMessages,
  stepCountIs
} from 'ai';
import { readUIMessageStream } from 'ai';

export const generateResponse = async (modelId, type, messages, apiKey, options = {}) => {
  // Validate API key
  if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 10) {
    const error = new Error('Invalid API key format or missing API key');
    throw error;
  }

  const model = getProvider(modelId, type, apiKey);
  const tools = options.enableTools ? getTools() : undefined;

  const stepData = [];
  let finalText = '';
  let streamError = null;

  try {
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
        finalText = text || '';
      },
      // Handle errors during streaming
      onError: ({ error }) => {
        streamError = error; // Store the error to yield later
      },
    });

    // Create a new result object to avoid spreading issues
    const streamResult = {
      text: finalText,
      toolCalls: [],
      toolResults: [],
      usage: {},
      requests: result.requests,
      // Add helper methods
      getStepData: () => {
        return stepData;
      },
      consumeUIMessageStream: async function* () {
        try {
          const uiStream = result.toUIMessageStream();
          yield* readUIMessageStream({
            stream: uiStream,
          });
        } catch (streamError) {
          throw streamError;
        }

        if (streamError) {
          yield { type: 'error', error: streamError };
        }
      },
    };

    return streamResult;

  } catch (error) {
    // Log the original error for debugging
    console.error('generateResponse error:', error);

    // Handle aborted requests
    if (error.name === 'AbortError') {
      throw new Error('Request was aborted');
    }

    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Failed to connect to OpenCode API');
    }

    // Handle API errors
    if (error.status) {
      let errorMessage = `API error (${error.status})`;

      // Try to parse error response
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // If parsing fails, use the original error message
        if (error.message) {
          errorMessage = error.message;
        }
      }

      throw new Error(errorMessage);
    }

    // Re-throw the error with a user-friendly message
    throw error;
  }
};