import { useCallback, useEffect, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import { useContextSelectionBridge } from './useContextSelectionBridge.js';
import { getRequiredApiKey } from '@/utils/models.ts';

export function useConversationLifecycle({
  chat,
  currentChatId,
  createNewChat,
  selectedModel,
  apiKey,
  googleApiKey,
  openRouterApiKey,
  anthropicApiKey,
  openaiApiKey,
  inputRef,
  isInitialDataLoading,
}) {
  const [attachedContextSnippets, setAttachedContextSnippets] = useState([]);
  const chatRef = useRef(chat);
  const currentChatIdRef = useRef(currentChatId);
  const currentChatMessagesRef = useRef([]);
  const previousChatIdRef = useRef(currentChatId);
  const pendingAttachQueueRef = useRef([]);

  useEffect(() => {
    chatRef.current = chat;
  }, [chat]);

  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  useEffect(() => {
    currentChatMessagesRef.current = chat?.messages ?? [];
  }, [chat?.messages]);

  useEffect(() => {
    if (previousChatIdRef.current && previousChatIdRef.current !== currentChatId) {
      setAttachedContextSnippets([]);
    }
    previousChatIdRef.current = currentChatId;
  }, [currentChatId]);

  const handleSend = useCallback(async (message) => {
    const currentChat = chatRef.current;
    let chatId = currentChatIdRef.current;
    if (!chatId) {
      chatId = await createNewChat();
    }

    const contexts = attachedContextSnippets
      .map((entry) => entry.text?.trim())
      .filter(Boolean);
    const userText = (message.text ?? '').trim();
    const contextBlock = contexts.length
      ? `Attached context:\n${contexts.join('\n\n')}`
      : '';
    const combinedText = [contextBlock, userText]
      .filter(Boolean)
      .join('\n\n');
    const hasText = combinedText.trim().length > 0;
    const hasAttachments = Boolean(message.files?.length);
    const hasContext = contexts.length > 0;

    const providerApiKeys = {
      openCode: apiKey,
      google: googleApiKey,
      openRouter: openRouterApiKey,
      anthropic: anthropicApiKey,
      openai: openaiApiKey,
    };

    const requiredKey = getRequiredApiKey(selectedModel, providerApiKeys);

    if (!requiredKey || !(hasText || hasAttachments || hasContext) || currentChat.status === 'error') {
      return;
    }

    if (currentChat.status !== 'ready') {
      return;
    }

    const payload = {
      ...message,
      text: combinedText,
    };

    try {
      await currentChat.sendMessage(payload);
      setAttachedContextSnippets([]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [
    apiKey,
    anthropicApiKey,
    attachedContextSnippets,
    createNewChat,
    googleApiKey,
    openRouterApiKey,
    openaiApiKey,
    selectedModel,
  ]);

  const handleSendRef = useRef(handleSend);
  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

  const handleExternalSelection = useCallback(async (rawText) => {
    const text = rawText?.trim();
    if (!text) {
      return;
    }

    const hasExistingMessages = currentChatMessagesRef.current.length > 0;
    const requiresNewChat = !currentChatIdRef.current || hasExistingMessages;

    if (requiresNewChat) {
      await createNewChat();
    }

    const textarea = inputRef?.current;
    if (textarea) {
      textarea.value = text;
      textarea.form?.requestSubmit();
    } else {
      await handleSendRef.current({ text });
    }
  }, [createNewChat, inputRef]);

  const commitAttachContext = useCallback(async (text) => {
    if (!currentChatIdRef.current) {
      await createNewChat();
    }

    setAttachedContextSnippets((prev) => [
      ...prev,
      {
        id: nanoid(),
        text,
      },
    ]);

    if (inputRef?.current) {
      inputRef.current.focus();
    }
  }, [createNewChat, inputRef]);

  const handleAttachContext = useCallback(async (rawText) => {
    const text = rawText?.trim();
    if (!text) {
      return;
    }

    if (isInitialDataLoading) {
      pendingAttachQueueRef.current.push(text);
      return;
    }

    await commitAttachContext(text);
  }, [commitAttachContext, isInitialDataLoading]);

  const removeContextSnippet = useCallback((id) => {
    setAttachedContextSnippets((prev) => prev.filter((snippet) => snippet.id !== id));
  }, []);

  useEffect(() => {
    if (!isInitialDataLoading) {
      const pending = pendingAttachQueueRef.current;
      if (pending.length > 0) {
        pendingAttachQueueRef.current = [];
        pending.forEach((text) => {
          void commitAttachContext(text);
        });
      }
    }
  }, [isInitialDataLoading, commitAttachContext]);

  useContextSelectionBridge({
    onExternalSelection: handleExternalSelection,
    onAttachContext: handleAttachContext,
  });

  return {
    attachedContextSnippets,
    handleSend,
    removeContextSnippet,
  };
}
