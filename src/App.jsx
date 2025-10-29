  import React, { useState, useEffect, useRef } from 'react';
import { Plus, Settings } from 'lucide-react';
import { useStorage } from './hooks/useStorage.js';
import { MODELS } from './utils/constants.js';
import { ThemeProvider } from './contexts/ThemeProvider.jsx';
import { ThemeSwitcher } from './components/settings/ThemeSwitcher.jsx';

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
import { AppSidebar } from './components/app-sidebar.jsx';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from './components/ui/sidebar.jsx';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './components/ui/breadcrumb.jsx';
import { Separator } from './components/ui/separator.jsx';
import { Button } from './components/ui/button.jsx';

import { Response } from './components/ai-elements/response.tsx';
import {
  Branch,
  BranchMessages,
} from './components/ai-elements/branch.tsx';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from './components/ai-elements/conversation.tsx';
import {
  Message,
  MessageAvatar,
  MessageContent,
} from './components/ai-elements/message.tsx';
import { toUIMessage } from './utils/messageUtils.js';
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from './components/ai-elements/prompt-input.tsx';



export default function App() {
  const [chatsData, setChatsData] = useState({});
  const [currentChatId, setCurrentChatIdState] = useState(null);
  const [keyInput, setKeyInput] = useState('');
  const [apiKey, setApiKey, isApiKeyLoading] = useStorage('apiKey', '');
  const [selectedModelId, setSelectedModelId, isModelLoading] = useStorage('selectedModelId', MODELS[0].id);
  const selectedModel = MODELS.find(m => m.id === selectedModelId) || MODELS[0];
  const [isInitialDataLoading, setIsInitialDataLoading] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);



  // Ref to hold the latest chatsData to solve stale state in async callbacks
  const chatsDataRef = useRef();
  chatsDataRef.current = chatsData;

  // Derived state from chatsData
  const chats = Object.values(chatsData).map(c => c.metadata).sort((a, b) => b.updatedAt - a.updatedAt);
  const currentChatMessages = chatsData[currentChatId]?.messages || [];
  const currentChatStatus = chatsData[currentChatId]?.status || 'ready';



  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsOpen && !event.target.closest('.relative')) {
        setSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [settingsOpen]);

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
       } else if (!activeChatId) {
         const newChat = await createChat();
         activeChatId = newChat.id;
         await setCurrentChatId(activeChatId);
         newChatsData[activeChatId] = {
           metadata: newChat,
           messages: [],
           status: 'ready'
         };
         setCurrentChatIdState(activeChatId);
       }

       setChatsData(newChatsData);
      setIsInitialDataLoading(false);
    };

    loadInitialData();
  }, []);

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

  const handleSend = async (message, event) => {
    let chatId = currentChatId;
    if (!chatId) {
      chatId = await createNewChat();
    }

    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!apiKey || !(hasText || hasAttachments) || chatsDataRef.current[chatId]?.status !== 'ready') return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      parts: [{ type: 'text', text: message.text || 'Sent with attachments' }]
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
    chrome.storage.local.clear();
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

  if (isApiKeyLoading || isModelLoading || isInitialDataLoading) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-sm text-gray-600">Loading...</div>
      </div>
    );
  }

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
        <button onClick={saveSettings} className="bg-blue-500 text-white px-4 py-2 rounded">
          Save & Start
        </button>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <SidebarProvider>
      <AppSidebar
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={createNewChat}
        onSelectChat={switchChat}
        onDeleteChat={deleteChatById}
      />
       <SidebarInset className="h-screen flex flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center justify-between px-4 w-full">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                <Button onClick={createNewChat} variant="ghost" size="default" className="h-12 w-12 p-0">
                  <Plus className="h-8 w-8" />
                </Button>
                <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                 <Breadcrumb>
                   <BreadcrumbList>
                     <BreadcrumbItem className="hidden md:block">
                       <BreadcrumbLink href="#">
                         AI Chat
                       </BreadcrumbLink>
                     </BreadcrumbItem>
                     <BreadcrumbSeparator className="hidden md:block" />
                     <BreadcrumbItem>
                       <BreadcrumbPage>{currentChatId ? chats.find(c => c.id === currentChatId)?.title || 'Chat' : 'No Chat'}</BreadcrumbPage>
                     </BreadcrumbItem>
                   </BreadcrumbList>
                 </Breadcrumb>
              </div>
              <div className="flex items-center space-x-2">
                 <div className="relative">
                    <Button
                      variant="ghost"
                      size="default"
                      onClick={() => setSettingsOpen(!settingsOpen)}
                      className="h-12 w-12 p-0"
                    >
                      <Settings className="h-8 w-8" />
                    </Button>
                   {settingsOpen && (
                     <div className="absolute right-0 top-full mt-1 w-48 bg-popover border rounded-md shadow-lg z-50">
                       <div className="p-2 space-y-1">
                         <div className="px-2 py-1 text-sm font-medium">Settings</div>
                         <div className="border-t pt-1">
                           <div className="px-2 py-1 text-xs text-muted-foreground">Theme</div>
                           <div className="p-2">
                             <ThemeSwitcher />
                           </div>
                         </div>
                         <button
                           onClick={clearSettings}
                           className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded"
                         >
                           Clear All Chats
                         </button>
                       </div>
                     </div>
                   )}
                 </div>
               </div>
           </div>
         </header>
           <div className="flex-1 flex flex-col overflow-hidden">
              {/* Conversation area - takes remaining space */}
              <div className="flex-1 overflow-hidden">
                <Conversation className="h-full">
                  <ConversationContent className="p-4">
                    {currentChatMessages.length === 0 ? (
                      <div className="flex size-full flex-col items-center justify-center gap-3 p-8 text-center">
                        <div className="space-y-1">
                          <h3 className="font-medium text-sm">No messages yet</h3>
                          <p className="text-muted-foreground text-sm">Start a conversation to see messages here</p>
                        </div>
                      </div>
                    ) : (
                      currentChatMessages.map((msg, i) => {
                        const uiMessage = toUIMessage(msg);
                        return (
                          <Branch key={`${currentChatId}-${i}`}>
                            <BranchMessages>
                                 <Message from={msg.role}>
                                   <MessageContent variant="flat">
                                     <Response>{uiMessage.content}</Response>
                                   </MessageContent>
                                </Message>
                            </BranchMessages>
                          </Branch>
                        );
                      })
                    )}
                  </ConversationContent>
                  <ConversationScrollButton />
                </Conversation>
              </div>

              {/* Prompt input - fixed at bottom */}
              <div className="border-t bg-background p-4">
                <PromptInput onSubmit={handleSend}>
                  <PromptInputBody>
                    <PromptInputTextarea />
                  </PromptInputBody>
                  <PromptInputFooter>
                    <PromptInputTools>
                      <PromptInputModelSelect onValueChange={changeModel} value={selectedModelId}>
                        <PromptInputModelSelectTrigger>
                          <PromptInputModelSelectValue />
                        </PromptInputModelSelectTrigger>
                        <PromptInputModelSelectContent>
                          {MODELS.map((model) => (
                            <PromptInputModelSelectItem
                              key={model.id}
                              value={model.id}
                            >
                              {model.name}
                            </PromptInputModelSelectItem>
                          ))}
                        </PromptInputModelSelectContent>
                      </PromptInputModelSelect>
                    </PromptInputTools>
                    <PromptInputSubmit status={currentChatStatus} />
                  </PromptInputFooter>
                </PromptInput>
              </div>
           </div>
          </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}