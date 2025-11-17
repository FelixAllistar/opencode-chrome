"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getChatsList,
  loadChatMessages,
  getCurrentChatId,
  setCurrentChatId as persistCurrentChatId,
  createChat as createChatMetadata,
  deleteChat as deleteChatStorage,
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

        if (activeChatId && initialChatsData[activeChatId]) {
          const chatMessages = await loadChatMessages(activeChatId);
          initialChatsData[activeChatId].messages = resetStreamingStatus(chatMessages);
        }

        if (!mounted) return;

        setChatsData(initialChatsData);
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
      const idsToDelete = Array.from(new Set(chatIds.filter(Boolean)));
      if (idsToDelete.length === 0) return;

      await Promise.all(idsToDelete.map((id) => deleteChatStorage(id)));

      let remainingMetadata = [];
      setChatsData((prev) => {
        const next = { ...prev };
        idsToDelete.forEach((id) => {
          delete next[id];
        });
        remainingMetadata = Object.values(next)
          .map((c) => c.metadata)
          .sort((a, b) => b.updatedAt - a.updatedAt);
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
