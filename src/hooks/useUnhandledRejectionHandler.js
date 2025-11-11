import { useEffect, useRef } from 'react';
import { createUnhandledRejectionHandler } from '@/utils/errorHandling.js';

export function useUnhandledRejectionHandler({
  currentChatId,
  chatsData,
  setChatsData,
}) {
  const currentChatIdRef = useRef(currentChatId);
  const chatsDataRef = useRef(chatsData);

  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  useEffect(() => {
    chatsDataRef.current = chatsData;
  }, [chatsData]);

  useEffect(() => {
    const handler = createUnhandledRejectionHandler(
      () => currentChatIdRef.current,
      () => chatsDataRef.current,
      setChatsData
    );

    window.addEventListener('unhandledrejection', handler);

    return () => {
      window.removeEventListener('unhandledrejection', handler);
    };
  }, [setChatsData]);
}
