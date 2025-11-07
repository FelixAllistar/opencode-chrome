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

  // Add logging for messages state changes
  useEffect(() => {
    console.log('📊 [useOpenCodeChat] Messages state changed:', {
      messagesCount: messages.length,
      lastMessage: messages[messages.length - 1],
      status
    });
  }, [messages, status]);
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
    console.log('🔄 [useOpenCodeChat] Syncing messages from chatsData:', {
      currentChatId,
      messagesCount: chatsData[currentChatId]?.messages?.length || 0,
      status: chatsData[currentChatId]?.status || 'ready'
    });
    setMessages(chatsData[currentChatId]?.messages || []);
    setStatus(chatsData[currentChatId]?.status || 'ready');
  }, [currentChatId]); // Remove chatsData dependency to prevent overwriting streaming state

  // Simple network connectivity test
  const testConnectivity = useCallback(async () => {
    console.log('🌐 [useOpenCodeChat] Testing API connectivity...');
    try {
      const response = await fetch('https://opencode.ai/zen/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (response.ok) {
        console.log('✅ [useOpenCodeChat] API connectivity test passed');
        console.log('🔍 [useOpenCodeChat] Response status:', response.status);
        return true;
      } else {
        console.error('❌ [useOpenCodeChat] API connectivity test failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ [useOpenCodeChat] API connectivity test error:', error);
      if (error.name === 'AbortError') {
        console.error('⏱️ [useOpenCodeChat] API connectivity test timed out');
      }
      return false;
    }
  }, [apiKey]);

  // Custom sendMessage that integrates with your chat system
  const sendMessage = useCallback(async (message) => {
    console.log('📤 [useOpenCodeChat] sendMessage called');
    console.log('🔍 [useOpenCodeChat] currentChatId:', currentChatId);
    console.log('🔍 [useOpenCodeChat] hasApiKey:', !!apiKey);
    console.log('🔍 [useOpenCodeChat] status:', status);
    console.log('🔍 [useOpenCodeChat] message:', message);

    // Test connectivity first (only on first message to avoid spam)
    if (messages.length === 0) {
      console.log('🔍 [useOpenCodeChat] First message, testing connectivity...');
      const connectivityOk = await testConnectivity();
      if (!connectivityOk) {
        console.error('❌ [useOpenCodeChat] Connectivity test failed, aborting message send');
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
      console.log('⚠️ [useOpenCodeChat] Early return - missing chatId, apiKey, or not ready');
      return;
    }

    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!hasText && !hasAttachments) {
      console.log('⚠️ [useOpenCodeChat] No content to send');
      return;
    }

    console.log('✅ [useOpenCodeChat] Proceeding with message sending');
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
    console.log('📝 [useOpenCodeChat] Total messages for API:', allMessages.length);

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
    console.log('🛑 [useOpenCodeChat] Created abort controller');

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

      console.log('🚀 [useOpenCodeChat] Calling generateResponse...');
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

      console.log('✅ [useOpenCodeChat] generateResponse completed');
      console.log('🔍 [useOpenCodeChat] Result object:', result);
      console.log('🌊 [useOpenCodeChat] Starting stream consumption...');

      // Validate stream before consumption
      if (!result || typeof result.consumeUIMessageStream !== 'function') {
        throw new Error('Invalid result object or missing consumeUIMessageStream method');
      }

      try {
        for await (const uiMessage of result.consumeUIMessageStream()) {
          console.log('📨 [useOpenCodeChat] Received uiMessage:', uiMessage);

          // Check for error parts
          if (uiMessage && uiMessage.type === 'error') {
            console.error('❌ [useOpenCodeChat] Error part received:', uiMessage.error);
            throw uiMessage.error;
          }

          // Check current streaming status using ref to avoid stale closure
          if (statusRef.current !== 'streaming') {
            console.log('⏹️ [useOpenCodeChat] Generation was stopped, breaking loop');
            break;
          }

          // Validate uiMessage structure
          if (!uiMessage || typeof uiMessage !== 'object') {
            console.warn('⚠️ [useOpenCodeChat] Invalid uiMessage structure:', uiMessage);
            continue;
          }

          // Update the AI message with streaming parts
          currentStreamingMessages = currentStreamingMessages.map(msg =>
            msg.id === aiMessageId
              ? { ...msg, parts: uiMessage.parts || [], status: 'streaming' }
              : msg
          );

          console.log('📝 [useOpenCodeChat] Updating messages with streaming parts:', {
            aiMessageId,
            partsCount: uiMessage.parts?.length || 0,
            currentMessagesCount: currentStreamingMessages.length
          });

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
        console.error('💥 [useOpenCodeChat] Error during stream consumption:', streamConsumptionError);
        console.error('💥 [useOpenCodeChat] Error type:', streamConsumptionError.constructor.name);
        console.error('💥 [useOpenCodeChat] Error message:', streamConsumptionError.message);

        // Check if this is a ReadableStreamDefaultController error
        if (streamConsumptionError.message && streamConsumptionError.message.includes('ReadableStreamDefaultController')) {
          console.error('🔥 [useOpenCodeChat] ReadableStreamDefaultController error detected - this is the root cause!');
          console.error('🔥 [useOpenCodeChat] Stream was likely in an error state before consumption started');
        }

        throw streamConsumptionError;
      }

      console.log('✅ [useOpenCodeChat] Stream consumption completed');

      // Mark as completed using the latest streaming messages
      const finalMessages = currentStreamingMessages.map(msg =>
        msg.id === aiMessageId ? { ...msg, status: 'ready' } : msg
      );

      console.log('🏁 [useOpenCodeChat] Stream completed, setting final messages:', {
        finalMessagesCount: finalMessages.length,
        aiMessageId,
        aiMessageParts: finalMessages.find(m => m.id === aiMessageId)?.parts
      });

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

      // Save to Chrome storage
      await saveChatMessages(currentChatId, finalMessages);

    } catch (streamError) {
      console.error('💥 [useOpenCodeChat] Error during streaming:', streamError);
      console.error('💥 [useOpenCodeChat] Error type:', streamError.constructor.name);
      console.error('💥 [useOpenCodeChat] Error message:', streamError.message);
      console.error('💥 [useOpenCodeChat] Error stack:', streamError.stack);

      const wasAborted = abortControllerRef.current?.signal.aborted;
      console.log('🔍 [useOpenCodeChat] Was aborted:', wasAborted);

      if (wasAborted) {
        setStatus('ready');
        setChatsData(prev => ({
          ...prev,
          [currentChatId]: {
            ...prev[currentChatId],
            status: 'ready'
          }
        }));
        return;
      }

      const errorForUI = createErrorForUI(streamError);
      setError(errorForUI);

      const errorMessages = newMessages.map(msg =>
        msg.id === aiMessageId
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
      );

      setMessages(errorMessages);
      setStatus('ready');
      setChatsData(prev => ({
        ...prev,
        [currentChatId]: {
          ...prev[currentChatId],
          messages: errorMessages,
          status: 'ready'
        }
      }));

      if (onError) {
        onError(errorForUI);
      }

      // Save error state
      await saveChatMessages(currentChatId, errorMessages);

    } finally {
      abortControllerRef.current = null;
      console.log('🧹 [useOpenCodeChat] Cleanup completed');
    }
  }, [currentChatId, apiKey, selectedModel, status, messages, setChatsData, onError]);

  // Custom stop function
  const stop = useCallback(() => {
    if (abortControllerRef.current && status === 'streaming') {
      abortControllerRef.current.abort();
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

  // Custom regenerate function
  const regenerate = useCallback(async () => {
    if (messages.length === 0 || status !== 'ready') return;

    // Remove last assistant message and regenerate
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      const messagesWithoutLast = messages.slice(0, -1);
      setMessages(messagesWithoutLast);
      setChatsData(prev => ({
        ...prev,
        [currentChatId]: {
          ...prev[currentChatId],
          messages: messagesWithoutLast
        }
      }));

      // Trigger regeneration by creating a synthetic message
      await sendMessage({ text: 'Regenerate the last response' });
    }
  }, [messages, status, currentChatId, setChatsData, sendMessage]);

  // Reload messages
  const reload = useCallback(() => {
    setMessages(chatsData[currentChatId]?.messages || []);
    setStatus(chatsData[currentChatId]?.status || 'ready');
  }, [currentChatId, chatsData]);

  return {
    messages,
    status,
    error,
    sendMessage,
    stop,
    regenerate,
    reload,
    setMessages
  };
}