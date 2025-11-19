import { generateId } from 'ai';

// Chat storage keys
const CHATS_LIST_KEY = 'opencode_chats_list';
const CHAT_PREFIX = 'opencode_chat_';

// Chat metadata structure
// {
//   id: string,
//   title: string,
//   createdAt: number,
//   updatedAt: number,
//   messageCount: number,
//   lastMessage: string
// }

// Get all chats metadata
export const getChatsList = async () => {
  try {
    const result = await chrome.storage.local.get([CHATS_LIST_KEY]);
    return result[CHATS_LIST_KEY] || [];
  } catch (error) {
    console.error('Error loading chats list:', error);
    return [];
  }
};

// Save chats list
const saveChatsList = async (chats) => {
  try {
    await chrome.storage.local.set({ [CHATS_LIST_KEY]: chats });
  } catch (error) {
    console.error('Error saving chats list:', error);
  }
};

// Create a new chat
export const createChat = async (title = 'New Chat') => {
  const chatId = generateId();
  const now = Date.now();

  const chatMetadata = {
    id: chatId,
    title,
    createdAt: now,
    updatedAt: now,
    messageCount: 0,
    lastMessage: ''
  };

  // Add to chats list
  const chats = await getChatsList();
  chats.unshift(chatMetadata); // Add to beginning
  await saveChatsList(chats);

  // Create empty messages array directly without calling saveChatMessages
  // to avoid unnecessary title generation
  await chrome.storage.local.set({ [CHAT_PREFIX + chatId]: [] });

  return chatMetadata;
};

// Load chat messages
export const loadChatMessages = async (chatId) => {
  try {
    const result = await chrome.storage.local.get([CHAT_PREFIX + chatId]);
    return result[CHAT_PREFIX + chatId] || [];
  } catch (error) {
    console.error('Error loading chat messages:', error);
    return [];
  }
};

// Save chat messages
export const saveChatMessages = async (chatId, messages, updateMetadata = true) => {
  try {
    await chrome.storage.local.set({ [CHAT_PREFIX + chatId]: messages });

    // Update chat metadata only if requested (prevents cleanup effect from updating titles)
    if (updateMetadata) {
      const chats = await getChatsList();
      const chatIndex = chats.findIndex(chat => chat.id === chatId);

      if (chatIndex !== -1) {
        const lastMessage = messages.length > 0 ?
          messages[messages.length - 1] : null;

        // Only update title if there are user messages and the current title is still "New Chat"
        const hasUserMessages = messages.some(msg => msg.role === 'user');
        const shouldUpdateTitle = hasUserMessages && (chats[chatIndex].title === 'New Chat' || !chats[chatIndex].title);

        chats[chatIndex] = {
          ...chats[chatIndex],
          updatedAt: Date.now(),
          messageCount: messages.length,
          lastMessage: lastMessage && lastMessage.role === 'user' ?
            lastMessage.parts.find(p => p.type === 'text')?.text || '' : '',
          title: shouldUpdateTitle ? generateChatTitle(messages) : chats[chatIndex].title
        };

        await saveChatsList(chats);
        return chats; // Return updated chats list for immediate UI refresh
      }
    }
    return null;
  } catch (error) {
    console.error('Error saving chat messages:', error);
    return null;
  }
};

// Delete a chat
export const deleteChat = async (chatId) => {
  await deleteChats([chatId]);
};

export const deleteChats = async (chatIds = []) => {
  const idsToDelete = Array.from(new Set((chatIds || []).filter(Boolean)));
  if (idsToDelete.length === 0) {
    return;
  }

  try {
    const chats = await getChatsList();
    const remainingChats = chats.filter((chat) => !idsToDelete.includes(chat.id));
    await saveChatsList(remainingChats);
    const keysToRemove = idsToDelete.map((id) => CHAT_PREFIX + id);
    await chrome.storage.local.remove(keysToRemove);
  } catch (error) {
    console.error('Error deleting chats:', error);
  }
};

// Generate a title from the first user message
const generateChatTitle = (messages) => {
  const firstUserMessage = messages.find(msg => msg.role === 'user');
  if (firstUserMessage) {
    const text = firstUserMessage.parts.find(p => p.type === 'text')?.text || '';
    if (text.trim()) {
      // Take first 30 characters and add ellipsis if needed
      return text.length > 30 ? text.substring(0, 30) + '...' : text;
    }
  }
  return 'New Chat';
};

// Get current chat ID from storage
export const getCurrentChatId = async () => {
  try {
    const result = await chrome.storage.local.get(['opencode_current_chat']);
    return result.opencode_current_chat;
  } catch (error) {
    console.error('Error getting current chat ID:', error);
    return null;
  }
};

// Set current chat ID
export const setCurrentChatId = async (chatId) => {
  try {
    await chrome.storage.local.set({ opencode_current_chat: chatId });
  } catch (error) {
    console.error('Error setting current chat ID:', error);
  }
};
