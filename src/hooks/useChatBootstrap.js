import { useEffect, useState } from 'react';
import {
  getChatsList,
  loadChatMessages,
  getCurrentChatId,
  setCurrentChatId
} from '@/utils/chatStorage.js';

const READY_STATUS = 'ready';

export function useChatBootstrap({ inputRef }) {
  const [chatsData, setChatsData] = useState({});
  const [currentChatId, setCurrentChatIdState] = useState(null);
  const [isInitialDataLoading, setIsInitialDataLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const resetStreamingStatus = (messages) =>
      messages.map((msg) => ({
        ...msg,
        status: msg.status === 'streaming' || msg.status === 'submitted' ? READY_STATUS : msg.status
      }));

    const loadInitialData = async () => {
      try {
        const [chatsList, currentId] = await Promise.all([
          getChatsList(),
          getCurrentChatId()
        ]);

        const newChatsData = {};
        for (const chat of chatsList) {
          newChatsData[chat.id] = {
            metadata: chat,
            messages: [],
            status: READY_STATUS
          };
        }

        let activeChatId = currentId;
        if (!activeChatId && chatsList.length > 0) {
          activeChatId = chatsList[0].id;
          await setCurrentChatId(activeChatId);
        }

        if (activeChatId && newChatsData[activeChatId]) {
          const chatMessages = await loadChatMessages(activeChatId);
          newChatsData[activeChatId].messages = resetStreamingStatus(chatMessages);

          if (mounted) {
            setCurrentChatIdState(activeChatId);
          }
        }

        if (mounted) {
          setChatsData(newChatsData);
          setIsInitialDataLoading(false);
        }
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

  useEffect(() => {
    if (isInitialDataLoading || !currentChatId || !inputRef?.current) {
      return undefined;
    }

    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isInitialDataLoading, currentChatId, inputRef]);

  return {
    chatsData,
    setChatsData,
    currentChatId,
    setCurrentChatIdState,
    isInitialDataLoading,
  };
}
