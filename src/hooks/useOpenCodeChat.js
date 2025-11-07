import { useState, useRef, useCallback, useEffect } from 'react';
import { generateResponse } from '../services/ai/client.js';
import { saveChatMessages } from '../utils/chatStorage.js';
import { createErrorForUI } from '../utils/errorHandling.js';

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

  // Update messages when current chat changes
  const chatsDataRef = useRef();
  chatsDataRef.current = chatsData;

  // Keep statusRef in sync with status state
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Sync messages with current chat (only when chatId changes, not on every chatsData change)
  useEffect(() => {
    setMessages(chatsData[currentChatId]?.messages || []);
    setStatus(chatsData[currentChatId]?.status || 'ready');
  }, [currentChatId]);

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

  // Custom sendMessage that integrates with your chat system
  const sendMessage = useCallback(async (message) => {
    // Test connectivity first (only on first message to avoid spam)
    if (messages.length === 0) {
      const connectivityOk = await testConnectivity();
      if (!connectivityOk) {
        const connectivityError = new Error('Failed to connect to OpenCode API. Please check your internet connection and API key.');
        const errorForUI = createErrorForUI(connectivityError);
        setError(errorForUI);
        if (onError) {
          onError(errorForUI);
        }
        return;
      }
    }

    if (!currentChatId || !apiKey || status !== 'ready') {
      return;
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

    // Filter existing messages (exclude errors)
    const existingMessages = messages.filter(msg =>
      !msg.parts?.some(part => part.type === 'tool-error')
    );

    const allMessages = [...existingMessages, userMessage];

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
      setChatsData(prev => ({
        ...prev,
        [currentChatId]: {
          ...prev[currentChatId],
          status: 'streaming'
        }
      }));

      const result = await generateResponse(
        selectedModel.id,
        selectedModel.type,
        allMessages,
        apiKey,
        {
          enableTools: true,
          system: 'You are a helpful AI assistant. Use tools when they can help answer the user\'s question.',
          abortSignal: abortControllerRef.current.signal,
        }
      );

      // Validate stream before consumption
      if (!result || typeof result.consumeUIMessageStream !== 'function') {
        throw new Error('Invalid result object or missing consumeUIMessageStream method');
      }

      try {
        for await (const uiMessage of result.consumeUIMessageStream()) {
          // Check for error parts
          if (uiMessage && uiMessage.type === 'error') {
            throw uiMessage.error;
          }

          // Check current streaming status using ref to avoid stale closure
          if (statusRef.current !== 'streaming') {
            break;
          }

          // Validate uiMessage structure
          if (!uiMessage || typeof uiMessage !== 'object') {
            continue;
          }

          // Update the AI message with streaming parts
          currentStreamingMessages = currentStreamingMessages.map(msg =>
            msg.id === aiMessageId
              ? { ...msg, parts: uiMessage.parts || [], status: 'streaming' }
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
      } catch (streamConsumptionError) {
        throw streamConsumptionError;
      }

      // Mark as completed using the latest streaming messages
      const finalMessages = currentStreamingMessages.map(msg =>
        msg.id === aiMessageId ? { ...msg, status: 'ready' } : msg
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
      const errorForUI = createErrorForUI(streamError);
      setError(errorForUI);

      const errorMessages = currentStreamingMessages.map(msg =>
        msg.id === aiMessageId ? { ...msg, status: 'error' } : msg
      );

      setMessages(errorMessages);
      setStatus('error');
      setChatsData(prev => ({
        ...prev,
        [currentChatId]: {
          ...prev[currentChatId],
          messages: errorMessages,
          status: 'error'
        }
      }));

      if (onError) {
        onError(errorForUI);
      }

      // Save error state
      await saveChatMessages(currentChatId, errorMessages);

    } finally {
      abortControllerRef.current = null;
    }
  }, [currentChatId, messages, status, apiKey, selectedModel, chatsData, setChatsData, onError, testConnectivity]);

  // Stop generation
  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
    // Reset status to ready when error is cleared
    if (status === 'error') {
      setStatus('ready');
      setChatsData(prev => ({
        ...prev,
        [currentChatId]: {
          ...prev[currentChatId],
          status: 'ready'
        }
      }));
    }
  }, [status, currentChatId, setChatsData]);

  // Retry last message
  const reload = useCallback(async () => {
    if (messages.length === 0) return;

    // Clear error before retrying
    setError(null);
    if (status === 'error') {
      setStatus('ready');
      setChatsData(prev => ({
        ...prev,
        [currentChatId]: {
          ...prev[currentChatId],
          status: 'ready'
        }
      }));
    }

    const lastUserMessage = messages.findLast(msg => msg.role === 'user');
    if (lastUserMessage) {
      // Remove the last assistant message and retry
      const messagesWithoutLastAssistant = messages.filter(msg =>
        !(msg.role === 'assistant' && msg.id > lastUserMessage.id)
      );

      setMessages(messagesWithoutLastAssistant);
      setChatsData(prev => ({
        ...prev,
        [currentChatId]: {
          ...prev[currentChatId],
          messages: messagesWithoutLastAssistant
        }
      }));

      await sendMessage({
        text: lastUserMessage.parts.find(p => p.type === 'text')?.text || '',
        files: lastUserMessage.parts.filter(p => p.type === 'file').map(p => ({
          mediaType: p.mediaType,
          url: p.url
        }))
      });
    }
  }, [messages, currentChatId, setChatsData, sendMessage, status, setError]);

  return {
    messages,
    status,
    error,
    sendMessage,
    stop,
    clearError,
    reload,
  };
}