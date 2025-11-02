/**
 * Error handling utilities for AI SDK errors and UI display
 */

import { flushSync } from 'react-dom';

export interface ErrorForUI {
  toolName: string;
  args: Record<string, any>;
  result: any;
  error: string;
  errorDetails: string;
  errorCategory: string;
  shouldRetry: boolean;
  retryDelay: number;
  toolCallId?: string;
}

/**
 * Formats AI SDK errors into user-friendly messages
 */
export const formatAIError = (error: Error): string => {
  const name = error.name || '';
  const message = error.message || 'Unknown error';

  if (name === 'AI_APICallError') {
    return `API Call Error: ${message}`;
  } else if (name === 'AI_NoOutputGeneratedError') {
    return `No Output Generated: ${message}`;
  } else if (name === 'AI_RetryError') {
    return `Retry Error: ${message}`;
  } else if (name === 'AI_ParseError') {
    return `Parse Error: ${message}`;
  } else if (name === 'AI_TooManyToolCallsError') {
    return `Too Many Tool Calls: ${message}`;
  } else if (name.startsWith('AI_')) {
    // Generic AI error formatting
    return `${name.replace('AI_', '').replace(/([A-Z])/g, ' $1').trim()}: ${message}`;
  } else {
    return `Error: ${message}`;
  }
};

/**
 * Creates a standardized error object for UI display
 */
export const createErrorForUI = (error: Error, toolCallId: string = 'error'): ErrorForUI => {
  return {
    toolName: 'Error',
    args: {},
    result: null,
    error: formatAIError(error),
    errorDetails: '',
    errorCategory: 'error',
    shouldRetry: false,
    retryDelay: 0,
    toolCallId
  };
};

  /**
   * Filters messages for API consumption, excluding error messages
   */
  export const filterMessagesForAPI = (messages: any[]): any[] => {
    return messages.filter(message => {
      // Exclude messages with error status
      if (message.status === 'error') {
        return false;
      }

      // Exclude messages that have error parts
      if (message.parts?.some((part: any) => part.type?.startsWith('tool-') && part.state === 'output-error')) {
        return false;
      }

      return true;
    });
  };

/**
 * Creates an unhandled promise rejection handler for AI SDK errors
 */
export const createUnhandledRejectionHandler = (
  getCurrentChatId: () => string | null,
  getChatsData: () => any,
  setChatsData: (updater: (prev: any) => any) => void
) => {
  return (event: PromiseRejectionEvent) => {
    console.error('🚨 Unhandled Promise Rejection:', event.reason);

    // Handle AI SDK errors that might not be caught by streaming
    if (event.reason?.name?.startsWith('AI_')) {
      console.log('🆘 Handling uncaught AI SDK error in UI');

      // Get the most recent chat to display the error
      const recentChatId = getCurrentChatId();
      const chatsData = getChatsData();

      if (recentChatId && chatsData[recentChatId] && chatsData[recentChatId].status !== 'error') {
        const errorForUI = createErrorForUI(event.reason);

        // Find the last AI message and update it with error details
        const messages = chatsData[recentChatId].messages;
        const lastAiMessage = [...messages].reverse().find((msg: any) => msg.role === 'assistant');

        // Skip if the last AI message already has an error
        const hasError = lastAiMessage?.parts?.some((part: any) => part.type?.startsWith('tool-') && part.state === 'output-error');
        if (lastAiMessage && !hasError) {
          flushSync(() => setChatsData((prev: any) => ({
            ...prev,
            [recentChatId]: {
              ...prev[recentChatId],
              status: 'error',
              messages: prev[recentChatId].messages.map((msg: any) =>
                msg.id === lastAiMessage.id
                  ? {
                      ...msg,
                      status: 'error',
                      parts: [{
                        type: 'tool-error',
                        state: 'output-error',
                        toolCallId: 'error',
                        errorText: errorForUI.error,
                        ...errorForUI
                      }]
                    }
                  : msg
              )
            }
          })));
        }
      }

      // Prevent the error from showing in console again
      event.preventDefault();
      return;
    }

    // Log other unhandled errors for debugging
    console.log('📋 Unhandled error details:', {
      name: event.reason?.name,
      message: event.reason?.message,
      stack: event.reason?.stack
    });
  };
};