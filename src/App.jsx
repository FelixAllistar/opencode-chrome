 import { useState, useEffect, useRef } from 'react';
import { Activity } from 'react';
import { useStorage } from './hooks/useStorage.js';
import { MODELS } from './utils/constants.js';
import { Message } from './components/chat/Message.jsx';
import { ChatInput } from './components/chat/ChatInput.jsx';
import { ModelSelector } from './components/settings/ModelSelector.jsx';
import { generateResponse } from './services/ai/client.js';
import {
  getChatsList,
  createChat,
  loadChatMessages,
  saveChatMessages,
  deleteChat,
  getCurrentChatId,
  setCurrentChatId
} from './utils/chatStorage.js';
import { ChatSidebar } from './components/ChatSidebar.jsx';

export default function App() {
  const [chatsData, setChatsData] = useState({});
  const [currentChatId, setCurrentChatIdState] = useState(null);
  const [keyInput, setKeyInput] = useState('');
  const [apiKey, setApiKey] = useStorage('apiKey', '');
  const [selectedModelId, setSelectedModelId] = useStorage('selectedModelId', MODELS[0].id);
  const selectedModel = MODELS.find(m => m.id === selectedModelId) || MODELS[0];
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [inputValue, setInputValue] = useStorage('inputValue', '');

  // Ref to hold the latest chatsData to solve stale state in async callbacks
  const chatsDataRef = useRef();
  chatsDataRef.current = chatsData;

  // Load chats and current chat on mount
  useEffect(() => {
    const loadInitialData = async () => {
      const [chatsList, currentId] = await Promise.all([
        getChatsList(),
        getCurrentChatId()
      ]);

      const newChatsData = {};
      for (const chat of chatsList) {
        newChatsData[chat.id] = {
          metadata: chat,
          messages: [],
          status: 'ready'
        };
      }

      let activeChatId = currentId;
      if (!activeChatId && chatsList.length > 0) {
        activeChatId = chatsList[0].id;
        await setCurrentChatId(activeChatId);
      }
      
      if (activeChatId && newChatsData[activeChatId]) {
        const chatMessages = await loadChatMessages(activeChatId);
        newChatsData[activeChatId].messages = chatMessages;
        setCurrentChatIdState(activeChatId);
      }

      setChatsData(newChatsData);
    };

    loadInitialData();
  }, []);

  // Derived state from chatsData
  const chats = Object.values(chatsData).map(c => c.metadata).sort((a, b) => b.updatedAt - a.updatedAt);
  const currentChatMessages = chatsData[currentChatId]?.messages || [];
  const currentChatStatus = chatsData[currentChatId]?.status || 'ready';

  const createNewChat = async () => {
    const newChatMetadata = await createChat();
    
    setChatsData(prev => ({
      ...prev,
      [newChatMetadata.id]: {
        metadata: newChatMetadata,
        messages: [],
        status: 'ready'
      }
    }));

    setCurrentChatIdState(newChatMetadata.id);
    await setCurrentChatId(newChatMetadata.id);
    return newChatMetadata.id;
  };

  const switchChat = async (chatId) => {
    if (chatId === currentChatId) return;

    setCurrentChatIdState(chatId);
    await setCurrentChatId(chatId);

    // Load messages if they haven't been loaded yet
    if (chatsData[chatId] && chatsData[chatId].messages.length === 0) {
      const messages = await loadChatMessages(chatId);
      setChatsData(prev => ({
        ...prev,
        [chatId]: {
          ...prev[chatId],
          messages: messages
        }
      }));
    }
  };

  const deleteChatById = async (chatId) => {
    await deleteChat(chatId);
    
    setChatsData(prev => {
      const newChats = { ...prev };
      delete newChats[chatId];
      return newChats;
    });

    if (chatId === currentChatId) {
      const remainingChats = Object.values(chatsData).map(c => c.metadata).filter(c => c.id !== chatId).sort((a, b) => b.updatedAt - a.updatedAt);
      if (remainingChats.length > 0) {
        await switchChat(remainingChats[0].id);
      } else {
        setCurrentChatIdState(null);
      }
    }
  };

  const saveSettings = () => {
    setApiKey(keyInput);
    setSelectedModelId(selectedModel.id);
  };

  const handleSend = async (input) => {
    let chatId = currentChatId;
    if (!chatId) {
      chatId = await createNewChat();
    }

    if (!apiKey || !input.trim() || chatsDataRef.current[chatId]?.status !== 'ready') return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      parts: [{ type: 'text', text: input }]
    };

    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage = {
      id: aiMessageId,
      role: 'assistant',
      parts: [{ type: 'text', text: '' }],
      status: 'submitted'
    };

    // Collect messages for AI (up to the current user message - don't include the empty AI response)
    const messagesToSend = [...(chatsDataRef.current[chatId]?.messages || []), userMessage];

    // Update state immediately
    setChatsData(prev => ({
      ...prev,
      [chatId]: {
        ...prev[chatId],
        messages: [...prev[chatId].messages, userMessage, aiMessage],
        status: 'submitted'
      }
    }));

    try {
      const result = await generateResponse(selectedModel.id, selectedModel.type, messagesToSend, apiKey);

      setChatsData(prev => ({
        ...prev,
        [chatId]: { ...prev[chatId], status: 'streaming' }
      }));

      for await (const part of result.textStream) {
        // Check if generation was stopped by looking at the ref
        if (chatsDataRef.current[chatId]?.status !== 'streaming') {
          break;
        }

        setChatsData(prev => ({
          ...prev,
          [chatId]: {
            ...prev[chatId],
            messages: prev[chatId].messages.map(msg =>
              msg.id === aiMessageId
                ? { ...msg, parts: [{ type: 'text', text: msg.parts[0].text + part }], status: 'streaming' }
                : msg
            )
          }
        }));
      }

    } catch (error) {
      console.error('Error generating response:', error);
      setChatsData(prev => ({
        ...prev,
        [chatId]: {
          ...prev[chatId],
          status: 'error',
          messages: prev[chatId].messages.map(msg =>
            msg.id === aiMessageId
              ? { ...msg, status: 'error', parts: [{ type: 'text', text: 'Sorry, there was an error.' }] }
              : msg
          )
        }
      }));
    } finally {
      // Final state update
      setChatsData(prev => ({
        ...prev,
        [chatId]: {
          ...prev[chatId],
          status: 'ready',
          messages: prev[chatId].messages.map(msg =>
            (msg.id === aiMessageId || msg.status === 'streaming') ? { ...msg, status: 'ready' } : msg
          )
        }
      }));
      
      // Save messages regardless of outcome, using the ref to get latest state
      const finalMessages = chatsDataRef.current[chatId]?.messages || [];
      const updatedChatsList = await saveChatMessages(chatId, finalMessages);

      if (updatedChatsList) {
        setChatsData(prev => {
          const newChatsData = { ...prev };
          updatedChatsList.forEach(meta => {
            if (newChatsData[meta.id]) {
              newChatsData[meta.id].metadata = meta;
            }
          });
          return newChatsData;
        });
      }
    }
  };

  const changeModel = (modelId) => {
    const model = MODELS.find(m => m.id === modelId);
    if (model) {
      setSelectedModelId(modelId);
    }
  };

  const clearSettings = () => {
    chrome.storage.sync.clear();
    setApiKey('');
    setSelectedModelId(MODELS[0].id);
    setChatsData({});
    setCurrentChatIdState(null);
  };

  const stopGeneration = async () => {
    const chatToStop = currentChatId;
    if (!chatToStop || chatsDataRef.current[chatToStop]?.status !== 'streaming') return;

    setChatsData(prev => ({
      ...prev,
      [chatToStop]: {
        ...prev[chatToStop],
        status: 'ready',
        messages: prev[chatToStop].messages.map(msg =>
          msg.status === 'streaming' ? { ...msg, status: 'ready' } : msg
        )
      }
    }));
    
    // Save the partially generated messages
    const finalMessages = chatsDataRef.current[chatToStop]?.messages || [];
    const updatedChatsList = await saveChatMessages(chatToStop, finalMessages);

    if (updatedChatsList) {
      setChatsData(prev => {
        const newChatsData = { ...prev };
        updatedChatsList.forEach(meta => {
          if (newChatsData[meta.id]) {
            newChatsData[meta.id].metadata = meta;
          }
        });
        return newChatsData;
      });
    }
  };

  if (!apiKey) {
    return (
      <div className="flex flex-col h-screen p-4 bg-gray-100">
        <h1 className="text-lg font-bold mb-4">AI Sidebar Setup</h1>
        <p className="mb-4">Enter your OpenCode Zen API key:</p>
        <input
          value={keyInput}
          onChange={e => setKeyInput(e.target.value)}
          className="border p-2 mb-4"
          placeholder="API Key"
          type="password"
        />
        <ModelSelector selectedModel={selectedModel} onChange={changeModel} />
        <button onClick={saveSettings} className="bg-blue-500 text-white px-4 py-2 rounded">
          Save & Start
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Chat Sidebar */}
      <Activity mode={sidebarVisible ? 'visible' : 'hidden'}>
        <ChatSidebar
          chats={chats}
          currentChatId={currentChatId}
          onNewChat={createNewChat}
          onSelectChat={switchChat}
          onDeleteChat={deleteChatById}
        />
      </Activity>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
          <h1 className="text-lg font-bold">AI Chat</h1>
          <div className="flex items-center space-x-2">
            <button onClick={() => setSidebarVisible(!sidebarVisible)} className="bg-gray-500 text-white px-3 py-1 text-sm rounded hover:bg-gray-600">
              {sidebarVisible ? 'Hide' : 'Show'} Sidebar
            </button>
            <ModelSelector selectedModel={selectedModel} onChange={changeModel} />
            <button onClick={clearSettings} className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600">
              Clear All
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {currentChatMessages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              {currentChatId ? 'Start a conversation!' : 'Select or create a chat to begin.'}
            </div>
          ) : (
            currentChatMessages.map((msg, i) => (
              <Message key={`${currentChatId}-${i}`} message={msg} />
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <ChatInput onSend={handleSend} status={currentChatStatus} inputValue={inputValue} setInputValue={setInputValue} />
            {(currentChatStatus === 'submitted' || currentChatStatus === 'streaming') && (
              <button
                onClick={stopGeneration}
                className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
              >
                Stop
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}