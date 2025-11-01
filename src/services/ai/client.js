import { streamText, convertToModelMessages, stepCountIs, readUIMessageStream } from 'ai';
import { getProvider } from './providers.js';
import { getTools } from './tools.js';

// Import icons for chain-of-thought steps
import { SearchIcon, BrainIcon, CodeIcon, ImageIcon } from 'lucide-react';

/**
 * Convert AI step data into chain-of-thought format
 */
function convertStepsToChainOfThought(steps) {
  return steps.map((step, index) => {
    let chainStep = {
      label: '',
      description: '',
      status: index < steps.length - 1 ? 'complete' : 'active',
      icon: BrainIcon,
    };

    // Handle different step types
    if (step.stepType === 'tool-call') {
      const toolCall = step.toolCalls[0];
      if (toolCall) {
        chainStep.label = `Using ${toolCall.toolName}`;
        chainStep.description = toolCall.args?.url || 'Processing request...';

        // Set appropriate icon based on tool
        if (toolCall.toolName === 'webFetch') {
          chainStep.icon = SearchIcon;
          chainStep.searchResults = [toolCall.args?.url].filter(Boolean);
        } else if (toolCall.toolName === 'analyzeCode') {
          chainStep.icon = CodeIcon;
        }

        // Add tool args and results
        chainStep.toolName = toolCall.toolName;
        chainStep.toolArgs = toolCall.args;
      }
    } else if (step.stepType === 'text' || step.text) {
      // Handle reasoning/text steps
      const text = step.text || '';
      if (text.trim()) {
        chainStep.label = text.length > 50 ? text.substring(0, 50) + '...' : text;
        chainStep.description = 'Thinking...';
        chainStep.icon = BrainIcon;
      }
    } else if (step.stepType === 'tool-result') {
      const toolResult = step.toolResults[0];
      if (toolResult) {
        chainStep.label = `Completed ${toolResult.toolName || 'tool'}`;
        chainStep.description = 'Processing result...';
        chainStep.icon = BrainIcon;
        chainStep.toolResult = toolResult.result;

        // Add search results if it's a web fetch result
        if (toolResult.result?.url) {
          chainStep.searchResults = [toolResult.result.url];
        }
      }
    }

    return chainStep;
  });
}

export const generateResponse = async (modelId, type, messages, apiKey, options = {}) => {
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
        console.error('Streaming error:', error);
        streamError = error; // Store the error to yield later
      },
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
        yield* readUIMessageStream({
          stream: result.toUIMessageStream(),
        });
        if (streamError) {
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