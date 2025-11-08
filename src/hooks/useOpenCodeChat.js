import { useState, useRef, useCallback, useEffect } from 'react';
import { streamText, convertToModelMessages } from 'ai';
import { getProvider } from '../services/ai/providers.js';
import { getTools } from '../services/ai/tools.js';
import { saveChatMessages } from '../utils/chatStorage.js';

const isVisualMessagePart = (part) => {
  if (!part || typeof part !== 'object') {
    return false;
  }
  if (part.type === 'image') {
    return true;
  }
  if (part.type === 'file') {
    return Boolean(part.mediaType?.startsWith?.('image/'));
  }
  return false;
};

/**
 * Custom hook that provides useChat-like functionality with OpenCode Zen integration
 */
export function useOpenCodeChat({
  currentChatId,
  chatsData,
  setChatsData,
  apiKey,
  selectedModel,
  onError
}) {
  const [status, setStatus] = useState('ready');
  const [messages, setMessages] = useState(chatsData[currentChatId]?.messages || []);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const statusRef = useRef(status);

  const currentChatData = chatsData[currentChatId];
  const isVisionModel = Boolean(selectedModel?.isVision ?? true);

  const prepareMessagesForModel = useCallback(
    (messages) => {
      if (isVisionModel) {
        return messages;
      }

      const filteredMessages = [];
      for (const message of messages) {
        const originalParts = message.parts || [];
        if (originalParts.length === 0) {
          filteredMessages.push(message);
          continue;
        }

        const filteredParts = originalParts.filter(
          (part) => !isVisualMessagePart(part)
        );

        if (filteredParts.length === 0) {
          if (message.role === 'user') {
            filteredMessages.push({
              ...message,
              parts: [{ type: 'text', text: 'Sent with attachments' }],
            });
          }
          continue;
        }

        filteredMessages.push({
          ...message,
          parts: filteredParts,
        });
      }

      return filteredMessages;
    },
    [isVisionModel]
  );

  // Update messages when current chat changes
  const chatsDataRef = useRef();
  chatsDataRef.current = chatsData;

  // Keep statusRef in sync with status state
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Sync messages with current chat (only when chatId changes, not on every chatsData change)
  useEffect(() => {
    if (!currentChatData) {
      setMessages([]);
      setStatus('ready');
      return;
    }

    setMessages(currentChatData.messages || []);
    setStatus(currentChatData.status || 'ready');
  }, [currentChatId, currentChatData]);

  // Simple network connectivity test
  const testConnectivity = useCallback(async () => {
    try {
      const response = await fetch('https://opencode.ai/zen/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }, [apiKey]);

  
  // Helper function to check if we can send messages
  const canSendMessage = useCallback(() => {
    return status === 'ready' && !error && apiKey && currentChatId;
  }, [status, error, apiKey, currentChatId]);

  // Reset chat state for severe error cases
  const resetChatState = useCallback(() => {
    setError(null);
    setStatus('ready');
    // Filter out error messages - AI SDK handles clean message preparation
    const cleanMessages = messages.filter(msg => msg.status !== 'error');
    setMessages(cleanMessages);
    setChatsData(prev => ({
      ...prev,
      [currentChatId]: {
        ...prev[currentChatId],
        status: 'ready',
        messages: cleanMessages
      }
    }));
  }, [currentChatId, setChatsData, messages]);

  // Regenerate response for existing messages (used by reload/retry)
  const regenerateResponse = useCallback(async (contextMessages) => {
    // Test connectivity first
    if (messages.length === 0) {
      const connectivityOk = await testConnectivity();
      if (!connectivityOk) {
        const error = {
          name: 'ConnectivityError',
          message: 'Failed to connect to OpenCode API. Please check your internet connection and API key.',
          error: 'Failed to connect to OpenCode API. Please check your internet connection and API key.'
        };
        setError(error);
        if (onError) {
          onError(error);
        }
        return;
      }
    }

    // Check if we can regenerate messages
    if (!apiKey || !currentChatId) return;

    // Create AbortController for this regeneration
    abortControllerRef.current = new AbortController();

    // Create a temporary AI message to track the regeneration
    const aiMessageId = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const aiMessage = {
      id: aiMessageId,
      role: 'assistant',
      parts: [],
      status: 'streaming'
    };

    // Add the AI message to the conversation
    const messagesWithAI = [...contextMessages, aiMessage];
    setMessages(messagesWithAI);
    setChatsData(prev => ({
      ...prev,
      [currentChatId]: {
        ...prev[currentChatId],
        messages: messagesWithAI
      }
    }));

    // Set up streaming
    setStatus('streaming');
    statusRef.current = 'streaming';
    setChatsData(prev => ({
      ...prev,
      [currentChatId]: {
        ...prev[currentChatId],
        status: 'streaming'
      }
    }));

    // Create AbortController for this regeneration
    abortControllerRef.current = new AbortController();

    // Track the current messages during streaming
    let currentStreamingMessages = messagesWithAI;

    try {
      // Use AI SDK's streamText directly with proper error handling
      const modelContext = prepareMessagesForModel(contextMessages);

      const result = await streamText({
        model: getProvider(selectedModel.id, selectedModel.type, apiKey),
        messages: convertToModelMessages(modelContext),
        tools: getTools(),
        system: 'You are a helpful AI assistant. Use tools when they can help answer the user\'s question.',
        abortSignal: abortControllerRef.current.signal,
        onError: ({ error }) => {
          // Let AI SDK handle the error gracefully
        }
      });

      let accumulatedText = '';
      let toolCalls = [];
      let reasoningParts = [];
      let currentTextId = null;

      // Use AI SDK's fullStream for better chunk handling
      for await (const chunk of result.fullStream) {
        // Check current streaming status using ref to avoid stale closure
        if (statusRef.current !== 'streaming') {
          break;
        }

        switch (chunk.type) {
          case 'text-delta':
            if (chunk.text) {
              accumulatedText += chunk.text;
            }
            break;

          case 'text-start':
            currentTextId = chunk.id;
            break;

          case 'text-end':
            currentTextId = null;
            break;

          case 'error':
            // Handle error chunk
            const errorObj = {
              name: chunk.error.name || 'AI_APICallError',
              message: chunk.error.message || 'An error occurred during streaming',
              error: chunk.error.message || 'An error occurred during streaming',
              cause: chunk.error.cause,
              stack: chunk.error.stack
            };

            currentStreamingMessages = currentStreamingMessages.map(msg =>
              msg.id === aiMessageId ? { ...msg, status: 'error' } : msg
            );

            setMessages(currentStreamingMessages);
            setStatus('error');
            statusRef.current = 'error';
            setError(errorObj);
            setChatsData(prev => ({
              ...prev,
              [currentChatId]: {
                ...prev[currentChatId],
                messages: currentStreamingMessages,
                status: 'error'
              }
            }));

            if (onError) {
              onError(errorObj);
            }

            saveChatMessages(currentChatId, currentStreamingMessages);
            break;

          case 'tool-call':
            toolCalls.push({
              type: `tool-${chunk.toolName}`,
              toolCallId: chunk.toolCallId,
              toolName: chunk.toolName,
              args: chunk.args,
              state: 'input-available'
            });
            break;

          case 'tool-result':
            toolCalls = toolCalls.map(call =>
              call.toolCallId === chunk.toolCallId
                ? {
                    ...call,
                    result: chunk.result,
                    state: 'output-available',
                    output: chunk.result
                  }
                : call
            );
            break;

          case 'reasoning-start':
            if (!reasoningParts.find(p => p.id === chunk.id)) {
              reasoningParts.push({
                id: chunk.id,
                type: 'reasoning',
                text: ''
              });
            }
            break;

          case 'reasoning-delta':
            const reasoningIndex = reasoningParts.findIndex(p => p.id === chunk.id);
            if (reasoningIndex >= 0) {
              reasoningParts[reasoningIndex].text += chunk.text;
            } else {
              reasoningParts.push({
                id: chunk.id,
                type: 'reasoning',
                text: chunk.text
              });
            }
            break;

          default:
            continue;
        }

        // Build parts array in the format the UI expects
        let updatedParts = [];

        // Add reasoning parts first (remove internal id)
        if (reasoningParts.length > 0) {
          const cleanReasoningParts = reasoningParts.map(({ id, ...part }) => part);
          updatedParts.push(...cleanReasoningParts);
        }

        // Add tool calls
        if (toolCalls.length > 0) {
          updatedParts.push(...toolCalls);
        }

        // Add text if we have any
        if (accumulatedText) {
          updatedParts.push({ type: 'text', text: accumulatedText });
        }

        // Update the AI message with current parts
        currentStreamingMessages = currentStreamingMessages.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, parts: updatedParts, status: 'streaming' }
            : msg
        );

        setMessages(currentStreamingMessages);
        setChatsData(prev => ({
          ...prev,
          [currentChatId]: {
            ...prev[currentChatId],
            messages: currentStreamingMessages
          }
        }));
      }

      // Build final parts array one more time
      let finalParts = [];

      // Add reasoning parts first (remove internal id)
      if (reasoningParts.length > 0) {
        const cleanReasoningParts = reasoningParts.map(({ id, ...part }) => part);
        finalParts.push(...cleanReasoningParts);
      }

      // Add tool calls
      if (toolCalls.length > 0) {
        finalParts.push(...toolCalls);
      }

      // Add text if we have any
      if (accumulatedText) {
        finalParts.push({ type: 'text', text: accumulatedText });
      }

      // Mark as completed using the latest streaming messages
      const finalMessages = currentStreamingMessages.map(msg =>
        msg.id === aiMessageId
          ? { ...msg, parts: finalParts, status: 'ready' }
          : msg
      );

      setMessages(finalMessages);
      setStatus('ready');
      setChatsData(prev => ({
        ...prev,
        [currentChatId]: {
          ...prev[currentChatId],
          messages: finalMessages,
          status: 'ready'
        }
      }));

      // Save to Chrome storage and get updated chats list
      const updatedChats = await saveChatMessages(currentChatId, finalMessages);

      // Update chatsData with the new metadata
      if (updatedChats && Array.isArray(updatedChats)) {
        const currentChatMetadata = updatedChats.find(c => c.id === currentChatId);
        if (currentChatMetadata) {
          setChatsData(prev => ({
            ...prev,
            [currentChatId]: {
              ...prev[currentChatId],
              metadata: currentChatMetadata
            }
          }));
        }
      }

    } catch (streamError) {
      const error = {
        name: streamError.name || 'StreamError',
        message: streamError.message || 'An error occurred during streaming',
        error: streamError.message || 'An error occurred during streaming',
        cause: streamError.cause,
        stack: streamError.stack
      };

      setError(error);

      const errorMessages = currentStreamingMessages.map(msg =>
        msg.id === aiMessageId ? { ...msg, status: 'error' } : msg
      );

      setMessages(errorMessages);
      setStatus('error');
      statusRef.current = 'error';
      setChatsData(prev => ({
        ...prev,
        [currentChatId]: {
          ...prev[currentChatId],
          messages: errorMessages,
          status: 'error'
        }
      }));

      if (onError) {
        onError(error);
      }

      await saveChatMessages(currentChatId, errorMessages);

    } finally {
      abortControllerRef.current = null;
    }
  }, [currentChatId, setChatsData, selectedModel, apiKey, onError, testConnectivity]);

  // Custom sendMessage that integrates with your chat system
  const sendMessage = useCallback(async (message) => {
        // Test connectivity first (only on first message to avoid spam)
    if (messages.length === 0) {
      const connectivityOk = await testConnectivity();
      if (!connectivityOk) {
        const error = {
          name: 'ConnectivityError',
          message: 'Failed to connect to OpenCode API. Please check your internet connection and API key.',
          error: 'Failed to connect to OpenCode API. Please check your internet connection and API key.' // For UI compatibility
        };
        setError(error);
        if (onError) {
          onError(error);
        }
        return;
      }
    }

    // Check if we can send messages (more robust for retry scenarios)
    if (!apiKey || !currentChatId) return;

    // If status is not ready, try to clear error and check again
    if (statusRef.current !== 'ready') {
      if (error) {
        await clearError();
      }
      // Check again after clearing error
      if (statusRef.current !== 'ready') return;
    }

    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!hasText && !hasAttachments) {
      return;
    }

    setError(null);

    // Build user message parts
    const userMessageParts = [];

    if (message.text) {
      userMessageParts.push({ type: 'text', text: message.text });
    }

    if (message.files && message.files.length > 0) {
      message.files.forEach(file => {
        userMessageParts.push({
          type: 'file',
          mediaType: file.mediaType,
          url: file.url
        });
      });
    }

    if (userMessageParts.length === 0) {
      userMessageParts.push({ type: 'text', text: 'Sent with attachments' });
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      parts: userMessageParts
    };

    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage = {
      id: aiMessageId,
      role: 'assistant',
      parts: [{ type: 'text', text: '' }],
      status: 'submitted'
    };

    // AI SDK handles message filtering automatically
    const allMessages = [...messages, userMessage];

    // Update state immediately
    const initialMessages = [...allMessages, aiMessage];
    setMessages(initialMessages);
    setStatus('submitted');

    // Update chatsData
    setChatsData(prev => ({
      ...prev,
      [currentChatId]: {
        ...prev[currentChatId],
        messages: initialMessages,
        status: 'submitted'
      }
    }));

    // Create abort controller
    abortControllerRef.current = new AbortController();

    // Track the current messages during streaming
    let currentStreamingMessages = initialMessages;

    try {
      setStatus('streaming');
      statusRef.current = 'streaming'; // Update ref immediately
      setChatsData(prev => ({
        ...prev,
        [currentChatId]: {
          ...prev[currentChatId],
          status: 'streaming'
        }
      }));

      // Use AI SDK's streamText directly with proper error handling
      const messagesForModel = prepareMessagesForModel(allMessages);

      const result = await streamText({
        model: getProvider(selectedModel.id, selectedModel.type, apiKey),
        messages: convertToModelMessages(messagesForModel),
        tools: getTools(),
        system: 'You are a helpful AI assistant. Use tools when they can help answer the user\'s question.',
        abortSignal: abortControllerRef.current.signal,
        onError: ({ error }) => {
          // Let AI SDK handle the error gracefully - don't throw
          // The error will be processed through the stream
        }
      });

      let accumulatedText = '';
      let toolCalls = [];
      let reasoningParts = [];
      let currentTextId = null;

      // Use AI SDK's fullStream for better chunk handling
      for await (const chunk of result.fullStream) {

        // Check current streaming status using ref to avoid stale closure
        if (statusRef.current !== 'streaming') {
          break;
        }

        switch (chunk.type) {
          case 'text-delta':
            if (chunk.text) {
              accumulatedText += chunk.text;
            }
            break;

          case 'text-start':
            // Start of text - track the ID
            currentTextId = chunk.id;
            break;

          case 'text-end':
            // End of text - clear the ID
            currentTextId = null;
            break;

          case 'error':
            // AI SDK error chunk - handle gracefully without throwing

            // Create error object for UI compatibility
            const errorObj = {
              name: chunk.error.name || 'AI_APICallError',
              message: chunk.error.message || 'An error occurred during streaming',
              error: chunk.error.message || 'An error occurred during streaming',
              cause: chunk.error.cause,
              stack: chunk.error.stack
            };

            // Set error state for this specific message
            currentStreamingMessages = currentStreamingMessages.map(msg =>
              msg.id === aiMessageId ? { ...msg, status: 'error' } : msg
            );

            setMessages(currentStreamingMessages);
            setStatus('error');
            statusRef.current = 'error';
            setError(errorObj);
            setChatsData(prev => ({
              ...prev,
              [currentChatId]: {
                ...prev[currentChatId],
                messages: currentStreamingMessages,
                status: 'error'
              }
            }));

            if (onError) {
              onError(errorObj);
            }

            // Save error state
            saveChatMessages(currentChatId, currentStreamingMessages);
            break;

          case 'tool-call':
            toolCalls.push({
              type: `tool-${chunk.toolName}`,
              toolCallId: chunk.toolCallId,
              toolName: chunk.toolName,
              args: chunk.args,
              state: 'input-available'
            });
            break;

          case 'tool-result':
            // Update tool call with result
            toolCalls = toolCalls.map(call =>
              call.toolCallId === chunk.toolCallId
                ? {
                    ...call,
                    result: chunk.result,
                    state: 'output-available',
                    output: chunk.result
                  }
                : call
            );
            break;

          case 'reasoning':
            reasoningParts.push({
              type: 'reasoning',
              text: chunk.text || chunk.reasoning || ''
            });
            break;

          case 'reasoning-start':
            // Start reasoning - initialize
            if (!reasoningParts.find(p => p.id === chunk.id)) {
              reasoningParts.push({
                id: chunk.id,
                type: 'reasoning',
                text: ''
              });
            }
            break;

          case 'reasoning-delta':
            // Append to existing reasoning part
            const reasoningIndex = reasoningParts.findIndex(p => p.id === chunk.id);
            if (reasoningIndex >= 0) {
              reasoningParts[reasoningIndex].text += chunk.text;
            } else {
              reasoningParts.push({
                id: chunk.id,
                type: 'reasoning',
                text: chunk.text
              });
            }
            break;

          case 'reasoning-end':
            // Reasoning completed
            break;

          case 'finish':
            // Stream completed
            break;

          case 'start':
          case 'start-step':
          case 'finish-step':
            // Control chunks, ignore for content
            break;

          default:
            // Ignore unknown chunks
            continue;
        }

        // Build parts array in the format the UI expects
        let updatedParts = [];

        // Add reasoning parts first (remove internal id)
        if (reasoningParts.length > 0) {
          const cleanReasoningParts = reasoningParts.map(({ id, ...part }) => part);
          updatedParts.push(...cleanReasoningParts);
        }

        // Add tool calls
        if (toolCalls.length > 0) {
          updatedParts.push(...toolCalls);
        }

        // Add text if we have any
        if (accumulatedText) {
          updatedParts.push({ type: 'text', text: accumulatedText });
        }

        
        // Update the AI message with current parts
        currentStreamingMessages = currentStreamingMessages.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, parts: updatedParts, status: 'streaming' }
            : msg
        );

        setMessages(currentStreamingMessages);
        setChatsData(prev => ({
          ...prev,
          [currentChatId]: {
            ...prev[currentChatId],
            messages: currentStreamingMessages
          }
        }));
      }

      // Build final parts array one more time to ensure everything is included
      let finalParts = [];

      // Add reasoning parts first (remove internal id)
      if (reasoningParts.length > 0) {
        const cleanReasoningParts = reasoningParts.map(({ id, ...part }) => part);
        finalParts.push(...cleanReasoningParts);
      }

      // Add tool calls
      if (toolCalls.length > 0) {
        finalParts.push(...toolCalls);
      }

      // Add text if we have any
      if (accumulatedText) {
        finalParts.push({ type: 'text', text: accumulatedText });
      }

      // Mark as completed using the latest streaming messages
      const finalMessages = currentStreamingMessages.map(msg =>
        msg.id === aiMessageId
          ? { ...msg, parts: finalParts, status: 'ready' }
          : msg
      );

      setMessages(finalMessages);
      setStatus('ready');
      setChatsData(prev => ({
        ...prev,
        [currentChatId]: {
          ...prev[currentChatId],
          messages: finalMessages,
          status: 'ready'
        }
      }));

      // Save to Chrome storage and get updated chats list
      const updatedChats = await saveChatMessages(currentChatId, finalMessages);

      // Update chatsData with the new metadata (including updated title)
      if (updatedChats && Array.isArray(updatedChats)) {
        // Find the updated metadata for the current chat
        const currentChatMetadata = updatedChats.find(c => c.id === currentChatId);
        if (currentChatMetadata) {
          setChatsData(prev => ({
            ...prev,
            [currentChatId]: {
              ...prev[currentChatId],
              metadata: currentChatMetadata
            }
          }));
        }
      }

    } catch (streamError) {
      // Use AI SDK's built-in error structure but maintain UI compatibility
      const error = {
        name: streamError.name || 'StreamError',
        message: streamError.message || 'An error occurred during streaming',
        error: streamError.message || 'An error occurred during streaming', // For UI compatibility
        cause: streamError.cause,
        stack: streamError.stack
      };

      setError(error);

      const errorMessages = currentStreamingMessages.map(msg =>
        msg.id === aiMessageId ? { ...msg, status: 'error' } : msg
      );

      setMessages(errorMessages);
      setStatus('error');
      statusRef.current = 'error'; // Update ref immediately
      setChatsData(prev => ({
        ...prev,
        [currentChatId]: {
          ...prev[currentChatId],
          messages: errorMessages,
          status: 'error'
        }
      }));

      if (onError) {
        onError(error);
      }

      // Save error state
      await saveChatMessages(currentChatId, errorMessages);

    } finally {
      abortControllerRef.current = null;
    }
  }, [currentChatId, messages, apiKey, selectedModel, chatsData, setChatsData, onError, testConnectivity]);

  // Stop generation
  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Clear error - only called explicitly by user action
  const clearError = useCallback(() => {
    setError(null);
    // Reset status to ready when explicitly clearing error
    setStatus('ready');
    statusRef.current = 'ready'; // Update ref immediately
    setChatsData(prev => ({
      ...prev,
      [currentChatId]: {
        ...prev[currentChatId],
        status: 'ready',
        // Keep existing messages, don't filter aggressively
        messages: prev[currentChatId]?.messages || []
      }
    }));
  }, [currentChatId, setChatsData]);

  // Regenerate last assistant response - AI SDK pattern (don't create new user message)
  const reload = useCallback(async () => {
    if (messages.length === 0) return;

    // Clear error state to remove error display
    setError(null);

    // Clear status to allow new attempt
    setStatus('ready');
    statusRef.current = 'ready';

    // Get current messages including error messages
    const currentMessages = messages;

    // Find the last user message to regenerate response for
    const lastUserMessage = currentMessages.findLast(msg =>
      msg.role === 'user' && msg.status !== 'error'
    );

    if (!lastUserMessage) {
      return;
    }

    // Remove only the last assistant message (failed one) and regenerate
    const messagesToRetry = currentMessages.filter(msg => {
      // Keep all user messages
      if (msg.role === 'user') return true;
      // Keep assistant messages that are NOT the last one
      if (msg.role === 'assistant') {
        const lastAssistantMessage = currentMessages.filter(m => m.role === 'assistant').pop();
        return msg.id !== lastAssistantMessage?.id;
      }
      return true;
    });

    // Update the message list to remove the failed assistant response
    setMessages(messagesToRetry);
    setChatsData(prev => ({
      ...prev,
      [currentChatId]: {
        ...prev[currentChatId],
        messages: messagesToRetry,
        status: 'ready'
      }
    }));

    // Create a regeneration function that doesn't add a new user message
    // Instead, it reuses the existing message context
    await regenerateResponse(messagesToRetry);
  }, [messages, currentChatId, setChatsData, selectedModel, apiKey]);

  return {
    messages,
    status,
    error,
    sendMessage,
    stop,
    clearError,
    reload,
    resetChatState,
  };
}
