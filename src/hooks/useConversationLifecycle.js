import { useCallback, useEffect, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import { useContextSelectionBridge } from './useContextSelectionBridge.js';

export function useConversationLifecycle({
  chat,
  currentChatId,
  createNewChat,
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

  const pendingMessageRef = useRef(null);
  const handleSendRef = useRef(null);

  useEffect(() => {
    // If we are still loading initial data, do not attempt to flush pending messages yet.
    // We will wait until isInitialDataLoading is false.
    if (isInitialDataLoading) return;

    if (chat && pendingMessageRef.current) {
      const message = pendingMessageRef.current;
      pendingMessageRef.current = null;
      // Use the ref to ensure we call the latest handleSend
      handleSendRef.current?.(message);
    }
  }, [chat, isInitialDataLoading]);

  const handleSend = useCallback(async (message) => {
    // If initial data is still loading, queue the message and return.
    if (isInitialDataLoading) {
      pendingMessageRef.current = message;
      return;
    }

    if (!currentChatIdRef.current) {
      pendingMessageRef.current = message;
      await createNewChat();
      return;
    }

    const currentChat = chatRef.current;
    // If we have an ID but no chat instance yet (or it's stale), wait for the effect
    if (!currentChat || typeof currentChat.sendMessage !== 'function') {
      pendingMessageRef.current = message;
      return;
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

    if (!(hasText || hasAttachments || hasContext)) {
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
  }, [attachedContextSnippets, createNewChat]);

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
      // If we need a new chat, just trigger handleSend with the text.
      // It will handle creation and pending message queueing.
      if (inputRef?.current) {
        // If we have the input, we can just clear the current chat ID ref 
        // to force a new one, but we need to be careful.

        // If we want to start a fresh chat but just put text in the box:

        // Guard against race with initial load
        if (!isInitialDataLoading) {
          await createNewChat();
        }

        const textarea = inputRef.current;
        textarea.value = text;
        textarea.focus();
      } else {
        // If no input ref (e.g. popup closed?), send immediately
        // This will trigger the createNewChat flow in handleSend
        await handleSendRef.current({ text });
      }
    } else {
      // Existing chat, append to input
      const textarea = inputRef?.current;
      if (textarea) {
        const currentVal = textarea.value;
        textarea.value = currentVal ? `${currentVal}\n\n${text}` : text;
        textarea.focus();
      } else {
        await handleSendRef.current({ text });
      }
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
