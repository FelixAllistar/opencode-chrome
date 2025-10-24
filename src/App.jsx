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
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatIdState] = useState(null);
  const [keyInput, setKeyInput] = useState('');
  const [apiKey, setApiKey] = useStorage('apiKey', '');
  const [selectedModelId, setSelectedModelId] = useStorage('selectedModelId', MODELS[0].id);
  const selectedModel = MODELS.find(m => m.id === selectedModelId) || MODELS[0];
  const [status, setStatus] = useState('ready'); // 'ready', 'submitted', 'streaming', 'error'
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [inputValue, setInputValue] = useStorage('inputValue', '');

  // Track streaming operations to prevent race conditions
  const streamingControllerRef = useRef(null);
  const isStreamingRef = useRef(false);

  // Load chats and current chat on mount
  useEffect(() => {
    const loadInitialData = async () => {
      const [chatsList, currentId] = await Promise.all([
        getChatsList(),
        getCurrentChatId()
      ]);

      setChats(chatsList);

      if (currentId && chatsList.find(chat => chat.id === currentId)) {
        setCurrentChatIdState(currentId);
        const chatMessages = await loadChatMessages(currentId);
        setMessages(chatMessages);
      } else if (chatsList.length > 0) {
        // Load the most recent chat
        const mostRecentChat = chatsList[0];
        setCurrentChatIdState(mostRecentChat.id);
        await setCurrentChatId(mostRecentChat.id);
        const chatMessages = await loadChatMessages(mostRecentChat.id);
        setMessages(chatMessages);
      }
    };

    loadInitialData();
  }, []);

  // Save messages on unmount to prevent data loss (but not during active operations)
  useEffect(() => {
    return () => {
      if (currentChatId && messages.length > 0 && !isStreamingRef.current && status === 'ready') {
        saveChatMessages(currentChatId, messages, false); // Don't update metadata in cleanup
      }
    };
  }, [currentChatId, messages, status]);

  const createNewChat = async () => {
    // Clear current messages first to avoid race conditions
    setMessages([]);
    setStatus('ready');
    
    const newChatId = await createChat();
    const updatedChats = await getChatsList();
    setChats(updatedChats);
    setCurrentChatIdState(newChatId);
    await setCurrentChatId(newChatId);
  };

  const switchChat = async (chatId) => {
    if (chatId === currentChatId) return;

    // Cancel any ongoing operations (streaming or submitted)
    isStreamingRef.current = false;
    streamingControllerRef.current = null;

    // Set status first to prevent any race conditions
    setStatus('ready');

    // Update chat state
    setCurrentChatIdState(chatId);
    await setCurrentChatId(chatId);

    // Load messages for the new chat
    const chatMessages = await loadChatMessages(chatId);
    setMessages(chatMessages);
  };

  const deleteChatById = async (chatId) => {
    await deleteChat(chatId);
    const updatedChats = await getChatsList();
    setChats(updatedChats);

    if (chatId === currentChatId) {
      // Switch to another chat or create new one
      if (updatedChats.length > 0) {
        await switchChat(updatedChats[0].id);
      } else {
        await createNewChat();
      }
    }
  };

  const saveSettings = () => {
    setApiKey(keyInput);
    setSelectedModelId(selectedModel.id);
  };

  const handleSend = async (input) => {
    if (!apiKey || !input.trim() || status !== 'ready') return;

    // If no current chat, create one automatically
    if (!currentChatId) {
      await createNewChat();
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      parts: [{ type: 'text', text: input }]
    };

    // Add empty AI message immediately
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage = {
      id: aiMessageId,
      role: 'assistant',
      parts: [{ type: 'text', text: '' }],
      status: 'submitted' // Track message status
    };

    setMessages(prev => [...prev, userMessage, aiMessage]);
    setStatus('submitted');

    // Set streaming controller reference early to handle chat switches during submission
    streamingControllerRef.current = currentChatId;

    try {
      const result = await generateResponse(
        selectedModel.id,
        selectedModel.type,
        input,
        apiKey
      );

      setStatus('streaming');
      isStreamingRef.current = true;
      streamingControllerRef.current = currentChatId;

      // Stream the response in real-time
      for await (const part of result.textStream) {
        // Check if we should still be streaming (user might have switched chats)
        if (!isStreamingRef.current || currentChatId !== streamingControllerRef.current) {
          break;
        }

        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  parts: [{ type: 'text', text: msg.parts[0].text + part }],
                  status: 'streaming'
                }
              : msg
          )
        );
      }

      // Only mark as completed if we're still in the same chat
      if (isStreamingRef.current && currentChatId === streamingControllerRef.current) {
        // Mark as completed
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === aiMessageId
              ? { ...msg, status: 'ready' }
              : msg
          )
        );

        setStatus('ready');
      }

      // Clean up streaming state
      isStreamingRef.current = false;
      streamingControllerRef.current = null;

       // Save messages and update chat metadata
       const updatedChats = await saveChatMessages(currentChatId, messages);
       // Use the returned chats list for immediate UI refresh, or fallback to fresh fetch
       if (updatedChats) {
         setChats([...updatedChats]);
       } else {
         const freshChats = await getChatsList();
         setChats([...freshChats]);
       }
     } catch (error) {
       console.error('Error generating response:', error);
       setMessages(prevMessages =>
         prevMessages.map(msg =>
           msg.id === aiMessageId
             ? {
                 ...msg,
                 parts: [{ type: 'text', text: 'Sorry, there was an error generating the response.' }],
                 status: 'error'
               }
             : msg
         )
       );
        setStatus('error');

        // Clean up streaming state on error
        isStreamingRef.current = false;
        streamingControllerRef.current = null;

        // Save messages even on error
        const updatedChats = await saveChatMessages(currentChatId, messages);
        // Use the returned chats list for immediate UI refresh, or fallback to fresh fetch
        if (updatedChats) {
          setChats([...updatedChats]);
        } else {
          const freshChats = await getChatsList();
          setChats([...freshChats]);
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
    setMessages([]);
    setChats([]);
    setCurrentChatIdState(null);
    setStatus('ready');
  };

  const stopGeneration = () => {
    // Cancel streaming operation
    isStreamingRef.current = false;
    streamingControllerRef.current = null;

    setStatus('ready');
    // Mark any streaming message as stopped
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.status === 'streaming'
          ? { ...msg, status: 'ready' }
          : msg
      )
    );
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
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              {currentChatId ? 'Start a conversation!' : 'Select or create a chat to begin.'}
            </div>
          ) : (
            messages.map((msg, i) => (
              <Message key={`${currentChatId}-${i}`} message={msg} />
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <ChatInput onSend={handleSend} status={status} inputValue={inputValue} setInputValue={setInputValue} />
            {(status === 'submitted' || status === 'streaming') && (
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