"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getChatsList,
  loadChatMessages,
  getCurrentChatId,
  setCurrentChatId as persistCurrentChatId,
  createChat as createChatMetadata,
  deleteChats,
} from '@/utils/chatStorage.js';

const READY_STATUS = 'ready';

const ChatStoreContext = createContext(null);

export function ChatStoreProvider({ children }) {
  const [chatsData, setChatsData] = useState({});
  const [currentChatId, setCurrentChatIdState] = useState(null);
  const [isInitialDataLoading, setIsInitialDataLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const resetStreamingStatus = (messages) =>
      messages.map((msg) => ({
        ...msg,
        status: msg.status === 'streaming' || msg.status === 'submitted' ? READY_STATUS : msg.status,
      }));

    const loadInitialData = async () => {
      try {
        const [chatsList, storedCurrentId] = await Promise.all([
          getChatsList(),
          getCurrentChatId(),
        ]);

        const initialChatsData = {};
        for (const chat of chatsList) {
          initialChatsData[chat.id] = {
            metadata: chat,
            messages: [],
            status: READY_STATUS,
          };
        }

        let activeChatId = storedCurrentId;
        if (!activeChatId && chatsList.length > 0) {
          activeChatId = chatsList[0].id;
          await persistCurrentChatId(activeChatId);
        }

        // Validate that the activeChatId actually exists in our data
        if (activeChatId && !initialChatsData[activeChatId]) {
          activeChatId = chatsList[0]?.id ?? null;
          await persistCurrentChatId(activeChatId);
        }

        if (activeChatId && initialChatsData[activeChatId]) {
          const chatMessages = await loadChatMessages(activeChatId);
          initialChatsData[activeChatId].messages = resetStreamingStatus(chatMessages);
        }

        if (!mounted) return;

        // Merge hydrated data with any live state that might have been created while loading
        setChatsData(prev => ({ ...initialChatsData, ...prev }));

        if (activeChatId) {
          setCurrentChatIdState(activeChatId);
        }
        setIsInitialDataLoading(false);
      } catch (error) {
        console.error('Failed to load chats:', error);
        if (mounted) {
          setIsInitialDataLoading(false);
        }
      }
    };

    void loadInitialData();

    return () => {
      mounted = false;
    };
  }, []);

  const createNewChat = useCallback(async () => {
    const newChatMetadata = await createChatMetadata();

    setChatsData((prev) => ({
      ...prev,
      [newChatMetadata.id]: {
        metadata: newChatMetadata,
        messages: [],
        status: READY_STATUS,
      },
    }));

    setCurrentChatIdState(newChatMetadata.id);
    await persistCurrentChatId(newChatMetadata.id);

    return newChatMetadata.id;
  }, []);

  const switchChat = useCallback(
    async (chatId) => {
      if (!chatId || chatId === currentChatId) return;

      setCurrentChatIdState(chatId);
      await persistCurrentChatId(chatId);

      const existing = chatsData[chatId];
      if (existing && (!existing.messages || existing.messages.length === 0)) {
        const messages = await loadChatMessages(chatId);
        const resetMessages = messages.map((msg) => ({
          ...msg,
          status: msg.status === 'streaming' || msg.status === 'submitted' ? READY_STATUS : msg.status,
        }));
        setChatsData((prev) => ({
          ...prev,
          [chatId]: {
            ...prev[chatId],
            messages: resetMessages,
          },
        }));
      }
    },
    [currentChatId, chatsData]
  );

  const deleteChatsByIds = useCallback(
    async (chatIds) => {
      const idsToDelete = Array.from(new Set((chatIds || []).filter(Boolean)));
      if (idsToDelete.length === 0) return;

      await deleteChats(idsToDelete);

      // Compute remaining chats from current snapshot
      const remainingMetadata = Object.values(chatsData)
        .filter((c) => !idsToDelete.includes(c.metadata.id))
        .map((c) => c.metadata)
        .sort((a, b) => b.updatedAt - a.updatedAt);

      setChatsData((prev) => {
        const next = { ...prev };
        idsToDelete.forEach((id) => {
          delete next[id];
        });
        return next;
      });

      if (!idsToDelete.includes(currentChatId)) {
        return;
      }

      if (remainingMetadata.length > 0) {
        await switchChat(remainingMetadata[0].id);
      } else {
        setCurrentChatIdState(null);
        await persistCurrentChatId(null);
      }
    },
    [currentChatId, switchChat]
  );

  const deleteChatById = useCallback(
    async (chatId) => {
      await deleteChatsByIds([chatId]);
    },
    [deleteChatsByIds]
  );

  const value = {
    chatsData,
    setChatsData,
    currentChatId,
    setCurrentChatIdState,
    isInitialDataLoading,
    createNewChat,
    switchChat,
    deleteChatById,
    deleteChatsByIds,
  };

  return <ChatStoreContext.Provider value={value}>{children}</ChatStoreContext.Provider>;
}

export function useChatStore() {
  const ctx = useContext(ChatStoreContext);
  if (!ctx) {
    throw new Error('useChatStore must be used within a ChatStoreProvider');
  }
  return ctx;
}
