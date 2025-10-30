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
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from './components/ai-elements/tool.tsx';
import { THEMES, THEME_VARIABLES } from './utils/themes.js';
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

  // Load theme immediately for loading screen
  const [theme, setTheme] = useStorage('theme', 'zenburn');
  const [isDark, setIsDark] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Apply theme immediately for loading screen
  useEffect(() => {
    const applyTheme = (themeName, darkMode) => {
      const themeData = THEMES[themeName];
      if (!themeData) return;

      const root = document.documentElement;

      Object.entries(THEME_VARIABLES).forEach(([cssVar, themeKey]) => {
        const color = themeData[themeKey]?.[darkMode ? 'dark' : 'light'];
        if (color) {
          root.style.setProperty(cssVar, color);
        }
      });

      root.style.setProperty('--card-text', '#1a1a1a');
      root.style.setProperty('--card-text-muted', '#4a4a4a');

      root.classList.remove('light', 'dark');
      root.classList.add(darkMode ? 'dark' : 'light');
    };

    applyTheme(theme, isDark);
  }, [theme, isDark]);

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
      console.log('🚀 Starting AI response generation...');

      // Enable tools by default
      const result = await generateResponse(selectedModel.id, selectedModel.type, messagesToSend, apiKey, {
        enableTools: true,
        system: 'You are a helpful AI assistant. Use tools when they can help answer the user\'s question.',
      });

      console.log('📥 Got result from generateResponse:', result);
      console.log('📥 Has textStream?', !!result.textStream);

      setChatsData(prev => ({
        ...prev,
        [chatId]: { ...prev[chatId], status: 'streaming' }
      }));

      console.log('📊 Status set to streaming');

       // Initialize AI message with empty parts array
       let currentText = '';
       const streamingToolParts = new Map(); // Track tool parts during streaming

       // Stream the full response including tools
       if (result.fullStream) {
         console.log('🔄 Starting to iterate over fullStream...');
         let streamCount = 0;

         for await (const part of result.fullStream) {
           streamCount++;
           console.log(`📝 Stream part ${streamCount}:`, part);

           // Check if generation was stopped
           if (chatsDataRef.current[chatId]?.status !== 'streaming') {
             console.log('⏹️ Generation was stopped, breaking out of stream');
             break;
           }

           // Handle text streaming
           if (typeof part === 'string') {
             currentText += part;
             console.log(`📄 Added string text, current length: ${currentText.length}`);
           } else if (part && part.type === 'text') {
             currentText += part.text;
             console.log(`📄 Added text part, current length: ${currentText.length}`);
           }

            // Handle tool call streaming
           else if (part && part.type === 'tool-call') {
             console.log('🔧 Tool call streaming:', part);
             console.log('🔧 Tool call input:', part.input, 'args:', part.args);
             const toolPart = {
               type: `tool-${part.toolName}`,
               toolCallId: part.toolCallId,
               toolName: part.toolName,
               input: part.input || part.args,
               state: 'input-available',
               output: undefined,
               errorText: undefined
             };
             console.log('🔧 Created tool part with input:', toolPart.input);
             streamingToolParts.set(part.toolCallId, toolPart);
           }

           // Handle tool result streaming
           else if (part && part.type === 'tool-result') {
             console.log('🔧 Tool result streaming:', part);
             const existingToolPart = streamingToolParts.get(part.toolCallId);
             if (existingToolPart) {
               existingToolPart.output = part.result;
               existingToolPart.errorText = part.error;
               existingToolPart.state = part.error ? 'output-error' : 'output-available';
             }
           }

           // Build current parts for streaming update
           const currentParts = [];
           if (currentText) {
             currentParts.push({ type: 'text', text: currentText });
           }
           currentParts.push(...streamingToolParts.values());

           // Update state with streaming content
           setChatsData(prev => {
             console.log('💾 Updating state with streaming content...');
             return {
               ...prev,
               [chatId]: {
                 ...prev[chatId],
                 messages: prev[chatId].messages.map(msg =>
                   msg.id === aiMessageId
                     ? { ...msg, parts: currentParts, status: 'streaming' }
                     : msg
                 )
               }
             };
           });
         }

         console.log(`✅ Stream completed after ${streamCount} parts`);
       } else {
         console.log('❌ No fullStream found in result!');
       }

      // Get step data and final text from the result
      const stepData = result.getStepData();
      const finalText = result.getFinalText();

      console.log('📋 Step data:', stepData);
      console.log('📋 Final text:', finalText);

      console.log('Step data from onStepFinish:', stepData);
      console.log('Final text:', finalText);

      // Build parts array from step data and final text using AI Elements format
      const finalParts = [];
      const toolParts = new Map(); // Map to combine tool calls and results by toolCallId

      // Process each step to extract tool calls and results
      for (const stepInfo of stepData) {
        // Add tool calls from this step - combine with existing or create new
        if (stepInfo.toolCalls && stepInfo.toolCalls.length > 0) {
          for (const toolCall of stepInfo.toolCalls) {
            console.log('🔧 Processing tool call:', toolCall);
            console.log('🔧 Tool call input:', toolCall.input, 'args:', toolCall.args);
            const toolPart = {
              type: `tool-${toolCall.toolName}`,
              toolCallId: toolCall.toolCallId,
              toolName: toolCall.toolName,
              input: toolCall.input || toolCall.args,
              state: 'input-available',
              output: undefined,
              errorText: undefined
            };
            console.log('🔧 Created final tool part with input:', toolPart.input);
            toolParts.set(toolCall.toolCallId, toolPart);
          }
        }

        // Update tool results for existing tool calls
        if (stepInfo.toolResults && stepInfo.toolResults.length > 0) {
          for (const toolResult of stepInfo.toolResults) {
            const existingToolPart = toolParts.get(toolResult.toolCallId);
            if (existingToolPart) {
              existingToolPart.output = toolResult.result;
              existingToolPart.errorText = toolResult.error;
              existingToolPart.state = toolResult.error ? 'output-error' : 'output-available';
            }
          }
        }

        // Add any text from this step
        if (stepInfo.text) {
          finalParts.push({ type: 'text', text: stepInfo.text });
        }
      }

      // Add all tool parts to final parts
      finalParts.push(...toolParts.values());

      // Add the final text response if not already included
      if (finalText && !finalParts.some(part => part.type === 'text' && part.text === finalText)) {
        finalParts.push({ type: 'text', text: finalText });
      }

      console.log('Final parts to render:', finalParts);

      // Final state update
      setChatsData(prev => ({
        ...prev,
        [chatId]: {
          ...prev[chatId],
          status: 'ready',
          messages: prev[chatId].messages.map(msg =>
            (msg.id === aiMessageId || msg.status === 'streaming') ? { ...msg, parts: finalParts, status: 'ready' } : msg
          )
        }
      }));

    } catch (error) {
      console.error('Error generating response:', error);
      setChatsData(prev => ({
        ...prev,
        [chatId]: {
          ...prev[chatId],
          status: 'error',
          messages: prev[chatId].messages.map(msg =>
            msg.id === aiMessageId
              ? { ...msg, status: 'error', parts: [{ type: 'text', text: `Sorry, there was an error: ${error.message}` }] }
              : msg
          )
        }
      }));
    } finally {
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

  // Render mixed content message parts (text + tool calls/results)
  const renderMessageParts = (message) => {
    console.log('Rendering message parts:', message.parts);

    if (!message.parts || message.parts.length === 0) {
      return <Response />;
    }

    return (
      <div className="space-y-4">
        {message.parts.map((part, index) => {
          console.log('Rendering part:', part.type, part);

          // Text part - use Response component for markdown rendering
          if (part.type === 'text') {
            return <Response key={`text-${index}`}>{part.text}</Response>;
          }

          // Tool part - display combined tool call and result information
          if (part.type.startsWith('tool-')) {
            return (
              <Tool key={`tool-${part.toolCallId}-${index}`} defaultOpen>
                <ToolHeader
                  type={part.type}
                  state={part.state || "input-available"}
                  title={part.toolName}
                />
                <ToolContent>
                  <ToolInput input={part.input} />
                  {(part.output !== undefined || part.errorText) && (
                    <ToolOutput
                      output={part.output}
                      errorText={part.errorText}
                    />
                  )}
                </ToolContent>
              </Tool>
            );
          }

          // Unknown part type - render as raw JSON for debugging
          return (
            <div key={`unknown-${index}`} className="p-4 bg-muted/50 rounded-md">
              <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide mb-2">
                Unknown Part Type: {part.type}
              </h4>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(part, null, 2)}
              </pre>
            </div>
          );
        })}
      </div>
    );
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
      <div className="flex h-screen bg-background items-center justify-center">
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
                        return (
                          <Branch key={`${currentChatId}-${i}`}>
                            <BranchMessages>
                                 <Message from={msg.role}>
                                   <MessageContent variant="flat">
                                     {renderMessageParts(msg)}
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