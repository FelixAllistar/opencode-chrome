import React, { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { Plus, Settings, BrainIcon, SearchIcon } from 'lucide-react';
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
import { createErrorForUI, createUnhandledRejectionHandler, filterMessagesForAPI } from './utils/errorHandling.js';
import { AppSidebar } from './components/app-sidebar.jsx';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
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
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
  ChainOfThoughtImage,
} from './components/ai-elements/chain-of-thought.tsx';
import { THEMES, THEME_VARIABLES } from './utils/themes.js';
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

// Constants for ChainOfThought processing
const CHAIN_OF_THOUGHT_LABELS = {
  THINKING: 'Thinking',
  USING_TOOL: 'Using',
  SUCCESS: 'Success',
  ERROR: 'Error',
  COMPLETE: 'Complete'
};

const CHAIN_OF_THOUGHT_DESCRIPTIONS = {
  ANALYZING_REQUEST: 'Analyzing the request',
  PROCESSING: 'Processing...',
  TOOL_EXECUTION_FAILED: 'Tool execution failed',
  SUCCESSFULLY_RETRIEVED: 'Successfully retrieved data',
  OPERATION_COMPLETED: 'Operation completed successfully'
};

const CHAIN_OF_THOUGHT_STATUSES = {
  COMPLETE: 'complete',
  ACTIVE: 'active',
  PENDING: 'pending'
};






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
  const inputRef = useRef(null);

  // Handle unhandled promise rejections at the app level
  useEffect(() => {
    const handleUnhandledRejection = createUnhandledRejectionHandler(
      () => currentChatId,
      () => chatsData,
      setChatsData
    );

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [currentChatId, chatsData, setChatsData]);



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
          // Reset any streaming/submitted statuses since they can't persist across app restarts
          const resetMessages = chatMessages.map(msg => ({
            ...msg,
            status: msg.status === 'streaming' || msg.status === 'submitted' ? 'ready' : msg.status
          }));
          newChatsData[activeChatId].messages = resetMessages;
          setCurrentChatIdState(activeChatId);
        }

       setChatsData(newChatsData);
      setIsInitialDataLoading(false);
    };

    loadInitialData();
  }, []);

  // Focus input when initial data loading completes and we have a current chat
  useEffect(() => {
    if (!isInitialDataLoading && currentChatId && inputRef.current) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isInitialDataLoading, currentChatId]);

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

    // Focus the input after creating new chat
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);

    return newChatMetadata.id;
  };

  const switchChat = async (chatId) => {
    if (chatId === currentChatId) return;

    setCurrentChatIdState(chatId);
    await setCurrentChatId(chatId);

    // Load messages if they haven't been loaded yet
    if (chatsData[chatId] && chatsData[chatId].messages.length === 0) {
      const messages = await loadChatMessages(chatId);
      // Reset any streaming/submitted statuses since they can't persist across app restarts
      const resetMessages = messages.map(msg => ({
        ...msg,
        status: msg.status === 'streaming' || msg.status === 'submitted' ? 'ready' : msg.status
      }));
      setChatsData(prev => ({
        ...prev,
        [chatId]: {
          ...prev[chatId],
          messages: resetMessages
        }
      }));
    }

    // Focus the input after switching chat
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
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
    // Filter out any messages with errors to avoid sending invalid content to the API
    const messagesToSend = [...filterMessagesForAPI(chatsDataRef.current[chatId]?.messages || []), userMessage];

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
      setChatsData(prev => ({
        ...prev,
        [chatId]: { ...prev[chatId], status: 'streaming' }
      }));

      // Consume the UI message stream and handle completion
      try {
        console.log('🚀 Starting stream consumption...');

        // Enable tools by default
        const result = await generateResponse(selectedModel.id, selectedModel.type, messagesToSend, apiKey, {
          enableTools: true,
          system: 'You are a helpful AI assistant. Use tools when they can help answer the user\'s question.',
        });

        console.log('✅ generateResponse completed successfully');

        for await (const uiMessage of result.consumeUIMessageStream()) {
          // Check for error parts
          if (uiMessage.type === 'error') {
            throw uiMessage.error;
          }

          // Check if generation was stopped
          if (chatsDataRef.current[chatId]?.status !== 'streaming') {
            console.log('⏹️ Generation was stopped, breaking out of loop');
            break;
          }

          // Update the AI message with streaming parts
          setChatsData(prev => ({
            ...prev,
            [chatId]: {
              ...prev[chatId],
              messages: prev[chatId].messages.map(msg =>
                msg.id === aiMessageId
                  ? { ...msg, parts: uiMessage.parts, status: 'streaming' }
                  : msg
              )
            }
          }));
        }

        console.log('✅ Stream consumption completed successfully');

        // Mark as completed
        setChatsData(prev => ({
          ...prev,
          [chatId]: {
            ...prev[chatId],
            status: 'ready',
            messages: prev[chatId].messages.map(msg =>
              msg.id === aiMessageId ? { ...msg, status: 'ready' } : msg
            )
          }
        }));

      } catch (streamError) {
        console.error('❌ Error during streaming or completion:', streamError);

        // Format the error directly for UI display
        const errorForUI = createErrorForUI(streamError);

        // Update the message with error details
        flushSync(() => setChatsData(prev => ({
          ...prev,
          [chatId]: {
            ...prev[chatId],
            status: 'ready', // Allow sending again after error
            messages: prev[chatId].messages.map(msg =>
              msg.id === aiMessageId
                ? {
                    ...msg,
                    status: 'error',
                    parts: [{
                      type: 'tool-result',
                      toolName: errorForUI.toolName,
                      args: errorForUI.args,
                      result: errorForUI.result,
                      error: errorForUI.error,
                      errorDetails: errorForUI.errorDetails,
                      errorCategory: errorForUI.errorCategory,
                      shouldRetry: errorForUI.shouldRetry,
                      retryDelay: errorForUI.retryDelay,
                      toolCallId: 'error'
                    }]
                  }
                : msg
            )
          }
        })));

        // Don't continue to the finally block if we've handled the error
        return;
      }

    } catch (error) {
      console.error('Error generating response:', error);

      // Format the error directly for UI display
      const errorForUI = createErrorForUI(error);

      flushSync(() => setChatsData(prev => ({
        ...prev,
        [chatId]: {
          ...prev[chatId],
          status: 'ready', // Allow sending again after error
          messages: prev[chatId].messages.map(msg =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  status: 'error',
                  parts: [{
                    type: 'tool-result',
                    toolName: errorForUI.toolName,
                    args: errorForUI.args,
                    result: errorForUI.result,
                    error: errorForUI.error,
                    errorDetails: errorForUI.errorDetails,
                    errorCategory: errorForUI.errorCategory,
                    shouldRetry: errorForUI.shouldRetry,
                    retryDelay: errorForUI.retryDelay,
                    toolCallId: 'error'
                  }]
                }
              : msg
          )
        }
      })));
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

  // Convert AI SDK 5.0 parts to chain-of-thought format
  const convertPartsToChainOfThought = (parts) => {
    // Check if we have any tool/reasoning parts that need conversion
    const hasToolOrReasoningParts = parts.some(part =>
      part.type === 'reasoning' ||
      part.type?.startsWith('tool-') ||
      part.type === 'tool-result'
    );

    if (!hasToolOrReasoningParts) {
      return parts; // Return as-is if no tool/reasoning parts
    }

    const chainOfThoughtSteps = [];
    const textParts = [];

    // Helper to extract tool name from part type
    const getToolName = (part) => {
      if (part.type === 'tool-result') {
        return part.toolName || 'Tool';
      }
      if (part.type?.startsWith('tool-')) {
        return part.type.replace('tool-', '');
      }
      return 'Unknown Tool';
    };

    // Helper to extract URL from tool input/output
    const extractUrl = (part) => {
      return part.output?.url || part.input?.url || part.result?.url || part.args?.url;
    };

    parts.forEach((part, index) => {
      if (part.type === 'reasoning') {
        chainOfThoughtSteps.push({
          label: CHAIN_OF_THOUGHT_LABELS.THINKING,
          description: CHAIN_OF_THOUGHT_DESCRIPTIONS.ANALYZING_REQUEST,
          status: index < parts.length - 1 ? CHAIN_OF_THOUGHT_STATUSES.COMPLETE : CHAIN_OF_THOUGHT_STATUSES.ACTIVE,
          icon: BrainIcon,
          content: (
            <div className="text-sm text-muted-foreground w-full overflow-x-auto whitespace-pre-wrap break-words">
              {part.text}
            </div>
          )
        });
      } else if (part.type?.startsWith('tool-') || part.type === 'tool-result') {
        const toolName = getToolName(part);
        const url = extractUrl(part);

        if (part.type === 'tool-result') {
          // Handle legacy tool-result format (from error handling)
          if (part.error) {
            chainOfThoughtSteps.push({
              label: `${toolName} ${CHAIN_OF_THOUGHT_LABELS.ERROR}`,
              description: part.error,
              status: CHAIN_OF_THOUGHT_STATUSES.COMPLETE,
              icon: SearchIcon,
              toolCallId: part.toolCallId
            });
          } else {
            const resultLabel = `${toolName} ${CHAIN_OF_THOUGHT_LABELS.COMPLETE}`;
            const resultDescription = url ? `Retrieved data from ${url}` : CHAIN_OF_THOUGHT_DESCRIPTIONS.OPERATION_COMPLETED;

            chainOfThoughtSteps.push({
              label: resultLabel,
              description: resultDescription,
              status: CHAIN_OF_THOUGHT_STATUSES.COMPLETE,
              icon: SearchIcon,
              searchResults: url ? [url] : undefined,
              toolCallId: part.toolCallId
            });
          }
        } else {
          // Handle AI SDK 5.0 tool-{toolName} format
          switch (part.state) {
            case 'input-available':
              chainOfThoughtSteps.push({
                label: `${CHAIN_OF_THOUGHT_LABELS.USING_TOOL} ${toolName}`,
                description: url
                  ? `Fetching: ${url}`
                  : `Calling ${toolName} with: ${JSON.stringify(part.input || {}).substring(0, 100)}...`,
                status: CHAIN_OF_THOUGHT_STATUSES.ACTIVE,
                icon: SearchIcon,
                searchResults: url ? [url] : undefined,
                toolCallId: part.toolCallId
              });
              break;

            case 'output-available':
              const successLabel = `${toolName} ${CHAIN_OF_THOUGHT_LABELS.SUCCESS}`;
              let successDescription = CHAIN_OF_THOUGHT_DESCRIPTIONS.SUCCESSFULLY_RETRIEVED;

              if (part.output?.status === 200) {
                successDescription = url ? `Successfully fetched ${url}` : `Fetched ${part.output.contentLength || 0} bytes`;
              } else if (part.output) {
                successDescription = url ? `Retrieved data from ${url}` : CHAIN_OF_THOUGHT_DESCRIPTIONS.OPERATION_COMPLETED;
              }

              chainOfThoughtSteps.push({
                label: successLabel,
                description: successDescription,
                status: CHAIN_OF_THOUGHT_STATUSES.COMPLETE,
                icon: SearchIcon,
                searchResults: url ? [url] : undefined,
                toolCallId: part.toolCallId
              });
              break;

            case 'output-error':
              chainOfThoughtSteps.push({
                label: `${toolName} ${CHAIN_OF_THOUGHT_LABELS.ERROR}`,
                description: part.errorText || CHAIN_OF_THOUGHT_DESCRIPTIONS.TOOL_EXECUTION_FAILED,
                status: CHAIN_OF_THOUGHT_STATUSES.COMPLETE,
                icon: SearchIcon,
                toolCallId: part.toolCallId
              });
              break;

            default:
              chainOfThoughtSteps.push({
                label: `${CHAIN_OF_THOUGHT_LABELS.USING_TOOL} ${toolName}`,
                description: CHAIN_OF_THOUGHT_DESCRIPTIONS.PROCESSING,
                status: CHAIN_OF_THOUGHT_STATUSES.PENDING,
                icon: SearchIcon,
                toolCallId: part.toolCallId
              });
          }
        }
      } else if (part.type === 'text') {
        textParts.push(part);
      }
    });

    // If we have chain-of-thought steps, create a chain-of-thought part
    if (chainOfThoughtSteps.length > 0) {
      const chainOfThoughtPart = {
        type: 'chain-of-thought',
        steps: chainOfThoughtSteps
      };
      // Return chain-of-thought part followed by any text parts
      return [chainOfThoughtPart, ...textParts];
    }

    return parts; // Return original parts if no conversion needed
  };

  const renderMessageParts = (message) => {
    if (!message.parts || message.parts.length === 0) {
      return message.status === 'streaming' ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="animate-pulse">Thinking...</div>
        </div>
      ) : (
        <Response />
      );
    }

    // Convert AI SDK 5.0 parts to chain-of-thought format
    const convertedParts = convertPartsToChainOfThought(message.parts);

    return (
      <div className="space-y-4">
        {convertedParts.map((part, index) => {
          // Chain of thought part
          if (part.type === 'chain-of-thought' && part.steps) {
            return (
              <ChainOfThought key={`chain-of-thought-${index}`} defaultOpen={false}>
                <ChainOfThoughtHeader>
                  Chain of Thought
                </ChainOfThoughtHeader>
                <ChainOfThoughtContent>
                  {part.steps.map((step, stepIndex) => (
                    <ChainOfThoughtStep
                      key={stepIndex}
                      icon={step.icon}
                      label={step.label}
                      description={step.description}
                      status={step.status}
                    >
                      {/* Show search results if available */}
                      {step.searchResults && step.searchResults.length > 0 && (
                        <ChainOfThoughtSearchResults>
                          {step.searchResults.map((url, urlIndex) => (
                            <ChainOfThoughtSearchResult key={urlIndex}>
                              {url}
                            </ChainOfThoughtSearchResult>
                          ))}
                        </ChainOfThoughtSearchResults>
                      )}

                      {/* Show image if available */}
                      {step.image && (
                        <ChainOfThoughtImage caption={step.image.caption}>
                          <img
                            src={step.image.src}
                            alt={step.image.alt}
                            className="max-w-full h-auto rounded"
                          />
                        </ChainOfThoughtImage>
                      )}

                      {/* Show custom content */}
                      {step.content && step.content}
                    </ChainOfThoughtStep>
                  ))}
                </ChainOfThoughtContent>
              </ChainOfThought>
            );
          }

          // Text part - use Response component for markdown rendering
          if (part.type === 'text') {
            return <Response key={`text-${index}`}>{part.text}</Response>;
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
        {message.status === 'streaming' && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="animate-pulse">Generating...</div>
          </div>
        )}
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
                      <PromptInputTextarea inputRef={inputRef} />
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