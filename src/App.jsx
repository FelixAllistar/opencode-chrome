import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, BrainIcon, SearchIcon, X } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useStorage } from './hooks/useStorage.js';
import { MODELS } from './utils/constants.js';
import { TOOL_DEFINITIONS, DEFAULT_ENABLED_TOOL_IDS } from './services/ai/tools/index';
import { setBraveSearchSubscriptionToken } from './services/ai/tools/braveSearchTool';
import { setContext7ApiKey as registerContext7ApiKey } from './services/ai/tools/context7Tool';

import { ThemeProvider } from './contexts/ThemeProvider.jsx';

import { useOpenCodeChat } from './hooks/useOpenCodeChat.js';
import {
  getChatsList,
  createChat,
  loadChatMessages,
  saveChatMessages,
  deleteChat,
  getCurrentChatId,
  setCurrentChatId
} from './utils/chatStorage.js';
import { createUnhandledRejectionHandler } from './utils/errorHandling.js';
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
import { SettingsMenu } from './components/settings/SettingsMenu.jsx';
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
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
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
  const [googleKeyInput, setGoogleKeyInput] = useState('');
  const [braveKeyInput, setBraveKeyInput] = useState('');
  const [context7KeyInput, setContext7KeyInput] = useState('');
  const [apiKey, setApiKey, isApiKeyLoading] = useStorage('apiKey', '');
  const [googleApiKey, setGoogleApiKey, isGoogleApiKeyLoading] = useStorage('googleApiKey', '');
  const [braveSearchApiKey, setBraveSearchApiKey, isBraveSearchApiKeyLoading] = useStorage('braveSearchApiKey', '');
  const [context7ApiKey, setContext7ApiKeyStorage, isContext7ApiKeyLoading] = useStorage('context7ApiKey', '');
  const [selectedModelId, setSelectedModelId, isModelLoading] = useStorage('selectedModelId', MODELS[0].id);
  const selectedModel = MODELS.find(m => m.id === selectedModelId) || MODELS[0];
  const [enabledToolIds, setEnabledToolIds] = useStorage('enabledTools', DEFAULT_ENABLED_TOOL_IDS);
  const [isInitialDataLoading, setIsInitialDataLoading] = useState(true);
  const [attachedContextSnippets, setAttachedContextSnippets] = useState([]);

  // Load theme immediately for loading screen
  const [theme, setTheme] = useStorage('theme', 'zenburn');
  const [isDark, setIsDark] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const inputRef = useRef(null);
  const currentChatIdRef = useRef(currentChatId);
  const currentChatMessagesRef = useRef([]);

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

  useEffect(() => {
    setKeyInput(apiKey);
  }, [apiKey]);

  useEffect(() => {
    setGoogleKeyInput(googleApiKey);
  }, [googleApiKey]);

  useEffect(() => {
    setBraveKeyInput(braveSearchApiKey);
  }, [braveSearchApiKey]);

  useEffect(() => {
    setContext7KeyInput(context7ApiKey);
  }, [context7ApiKey]);

  useEffect(() => {
    setBraveSearchSubscriptionToken(braveSearchApiKey);
  }, [braveSearchApiKey]);

  useEffect(() => {
    registerContext7ApiKey(context7ApiKey);
  }, [context7ApiKey]);



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

  const handleToggleTool = useCallback((toolId, enable) => {
    setEnabledToolIds((previous) => {
      const normalizedSet = new Set(
        Array.isArray(previous) ? previous : DEFAULT_ENABLED_TOOL_IDS
      );

      if (enable) {
        normalizedSet.add(toolId);
      } else {
        normalizedSet.delete(toolId);
      }

      return TOOL_DEFINITIONS.filter((definition) =>
        normalizedSet.has(definition.id)
      ).map((definition) => definition.id);
    });
  }, [setEnabledToolIds]);

  // Ref to hold the latest chatsData to solve stale state in async callbacks
  const chatsDataRef = useRef();
  chatsDataRef.current = chatsData;

  // Use our custom useOpenCodeChat hook
  const chat = useOpenCodeChat({
    currentChatId,
    chatsData,
    setChatsData,
    apiKey,
    googleApiKey,
    selectedModel,
    enabledToolIds,
    onError: (errorForUI) => {
      console.error('Chat error in useOpenCodeChat:', errorForUI);
      // You can add additional error handling here if needed
    }
  });

  const chatRef = useRef(chat);
  useEffect(() => {
    chatRef.current = chat;
  }, [chat]);

  // The useOpenCodeChat hook handles updating chatsData internally

  // Derived state from chatsData
  const chats = Object.values(chatsData).map(c => c.metadata).sort((a, b) => b.updatedAt - a.updatedAt);
  const currentChatMessages = chat.messages || [];
  const currentChatStatus = chat.status;

  useEffect(() => {
    currentChatIdRef.current = currentChatId;
  }, [currentChatId]);

  useEffect(() => {
    currentChatMessagesRef.current = currentChatMessages;
  }, [currentChatMessages]);



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

  const createNewChat = useCallback(async () => {
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
    setAttachedContextSnippets([]);
    await setCurrentChatId(newChatMetadata.id);

    // Focus the input after creating new chat
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);

    return newChatMetadata.id;
  }, [setAttachedContextSnippets, setChatsData, setCurrentChatIdState, setCurrentChatId]);

  const switchChat = async (chatId) => {
    if (chatId === currentChatId) return;

    setAttachedContextSnippets([]);
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
    setGoogleApiKey(googleKeyInput);
    setBraveSearchApiKey(braveKeyInput);
    setContext7ApiKeyStorage(context7KeyInput);
    setSelectedModelId(selectedModel.id);
  };

  const handleSaveKeys = (newApiKey, newGoogleApiKey, newBraveSearchApiKey, newContext7ApiKey) => {
    setApiKey(newApiKey);
    setGoogleApiKey(newGoogleApiKey);
    setBraveSearchApiKey(newBraveSearchApiKey);
    setContext7ApiKeyStorage(newContext7ApiKey);
  };

  const handleSend = useCallback(async (message, event) => {
    const currentChat = chatRef.current;
    let chatId = currentChatId;
    if (!chatId) {
      chatId = await createNewChat();
    }

    const contexts = attachedContextSnippets
      .map((entry) => entry.text?.trim())
      .filter(Boolean);
    const userText = (message.text ?? '').trim();
    const contextBlock = contexts.length
      ? `Attached context:` +
        `\n${contexts.join('\n\n')}`
      : '';
    const combinedText = [contextBlock, userText]
      .filter(Boolean)
      .join('\n\n');
    const hasText = combinedText.trim().length > 0;
    const hasAttachments = Boolean(message.files?.length);
    const hasContext = contexts.length > 0;
    const requiredKey = selectedModel?.type === 'google' ? googleApiKey : apiKey;

    // Follow AI SDK pattern: disable input during error states
    if (!requiredKey || !(hasText || hasAttachments || hasContext) || currentChat.status === 'error') {
      // Don't clear error automatically - let user explicitly dismiss or retry
      return;
    }

    // Only allow sending when status is 'ready'
    if (currentChat.status !== 'ready') {
      return;
    }

    const payload = {
      ...message,
      text: combinedText,
    };

    try {
      // Use our chat hook to send the message
      await currentChat.sendMessage(payload);
      setAttachedContextSnippets([]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Error handling is managed by the useOpenCodeChat hook
    }
  }, [apiKey, attachedContextSnippets, createNewChat, currentChatId, googleApiKey, selectedModel]);

  const handleExternalSelection = useCallback(async (rawText) => {
    const text = rawText?.trim();
    if (!text) {
      return;
    }

    const hasExistingMessages = currentChatMessagesRef.current.length > 0;
    const requiresNewChat = !currentChatIdRef.current || hasExistingMessages;

    if (requiresNewChat) {
      await createNewChat();
    }

    const textarea = inputRef.current;
    if (textarea) {
      textarea.value = text;
      textarea.form?.requestSubmit();
    } else {
      await handleSend({ text });
    }
  }, [createNewChat, handleSend]);

  const handleAttachContext = useCallback(async (rawText) => {
    const text = rawText?.trim();
    if (!text) {
      return;
    }

    if (!currentChatIdRef.current) {
      await createNewChat();
    }

    setAttachedContextSnippets((prev) => [
      ...prev,
      {
        id: nanoid(),
        text,
      },
    ]);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [createNewChat]);

  const removeContextSnippet = useCallback((id) => {
    setAttachedContextSnippets((prev) => prev.filter((snippet) => snippet.id !== id));
  }, []);

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      return;
    }

    const handleRuntimeMessage = (message) => {
      if (message?.type === 'openSidebar_contextSelection') {
        void handleExternalSelection(message.payload?.text);
      }
      if (message?.type === 'openSidebar_contextAttachment') {
        void handleAttachContext(message.payload?.text);
      }
    };

    chrome.runtime.onMessage.addListener(handleRuntimeMessage);

    if (typeof chrome.runtime.sendMessage === 'function') {
      chrome.runtime.sendMessage(
        { type: 'openSidebar_getPendingSelections' },
        (response) => {
          if (chrome.runtime.lastError) {
            return;
          }

          const selections = response?.selections;
          if (Array.isArray(selections) && selections.length > 0) {
            (async () => {
              for (const selection of selections) {
                if (!selection?.text) {
                  continue;
                }
                if (selection.type === 'attach') {
                  await handleAttachContext(selection.text);
                } else {
                  await handleExternalSelection(selection.text);
                }
              }
            })();
          }
        }
      );
    }

    return () => {
      chrome.runtime.onMessage.removeListener(handleRuntimeMessage);
    };
  }, [handleAttachContext, handleExternalSelection]);

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
  setGoogleApiKey('');
  setBraveSearchApiKey('');
  setContext7ApiKeyStorage('');
  setKeyInput('');
  setGoogleKeyInput('');
  setBraveKeyInput('');
  setContext7KeyInput('');
  setSelectedModelId(MODELS[0].id);
  setChatsData({});
  setCurrentChatIdState(null);
};

  // Convert AI SDK 5.0 parts to chain-of-thought format
  const convertPartsToChainOfThought = (parts) => {
    // Check if we have any tool/reasoning parts that need conversion (excluding errors)
    const hasToolOrReasoningParts = parts.some(part =>
      part.type === 'reasoning' ||
      (part.type?.startsWith('tool-') && part.state !== 'output-error')
    );

    if (!hasToolOrReasoningParts) {
      return parts; // Return as-is if no tool/reasoning parts
    }

    const chainOfThoughtSteps = [];
    const textParts = [];

    // Helper to extract tool name from AI SDK 5.0 part type
    const getToolName = (part) => {
      if (part.type?.startsWith('tool-')) {
        return part.type.replace('tool-', '');
      }
      return 'Unknown Tool';
    };

    // Helper to extract URL from AI SDK 5.0 tool input/output
    const extractUrl = (part) => {
      return part.output?.url || part.input?.url;
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
      } else if (part.type?.startsWith('tool-') && part.state !== 'output-error') {
        const toolName = getToolName(part);
        const url = extractUrl(part);

        // Handle AI SDK 5.0 tool-{toolName} format (excluding errors)
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

          default:
            chainOfThoughtSteps.push({
              label: `${CHAIN_OF_THOUGHT_LABELS.USING_TOOL} ${toolName}`,
              description: CHAIN_OF_THOUGHT_DESCRIPTIONS.PROCESSING,
              status: CHAIN_OF_THOUGHT_STATUSES.PENDING,
              icon: SearchIcon,
              toolCallId: part.toolCallId
            });
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

  const IMAGE_URL_REGEX = /(https?:\/\/[^\s]+\.(?:png|jpe?g|gif|webp|bmp|svg)(?:\?[^\s]*)?)/gi;

  const extractImageUrlsFromText = (text = '') => {
    if (!text) return [];
    const matches = text.match(IMAGE_URL_REGEX);
    if (!matches) return [];
    return Array.from(new Set(matches));
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

           // Error part - display as error card
           if (part.type?.startsWith('tool-') && part.state === 'output-error') {
             return (
               <div key={`error-${index}`} className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                 <div className="flex items-center gap-2 text-destructive">
                   <div className="font-medium text-sm">Error</div>
                 </div>
                 <div className="text-sm text-destructive/80 mt-1">
                   {part.errorText || part.error || 'An error occurred'}
                 </div>
               </div>
             );
           }

            // Text part - use Response component for markdown rendering
            if (part.type === 'text') {
              const text = part.text || '';
              const imageUrls = extractImageUrlsFromText(text);

              return (
                <div key={`text-${index}`} className="space-y-4">
                  <Response>{text}</Response>
                  {imageUrls.length > 0 && (
                    <div className="flex flex-col gap-4">
                      {imageUrls.map((url, urlIndex) => (
                        <div key={`${url}-${urlIndex}`} className="rounded-lg border bg-background p-2">
                          <img
                            src={url}
                            alt="Linked content"
                            className="max-w-full h-auto rounded-md shadow-sm"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Image part - display image from URL
            if (part.type === 'file' && part.mediaType?.startsWith('image/')) {
              return (
                <div key={`image-${index}`} className="my-4">
                  <img
                    src={part.url}
                    alt={part.filename || 'Image'}
                    className="max-w-full h-auto rounded-lg border shadow-sm"
                    loading="lazy"
                  />
                </div>
              );
            }

            // Binary image part - convert to data URL
            if (part.type === 'image') {
              const dataUrl = part.image instanceof Uint8Array
                ? `data:image/png;base64,${btoa(String.fromCharCode(...part.image))}`
                : typeof part.image === 'string' && part.image.startsWith('data:')
                  ? part.image
                  : `data:image/png;base64,${part.image}`;
              return (
                <div key={`image-${index}`} className="my-4">
                  <img
                    src={dataUrl}
                    alt="Generated image"
                    className="max-w-full h-auto rounded-lg border shadow-sm"
                    loading="lazy"
                  />
                </div>
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
        {message.status === 'streaming' && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="animate-pulse">Generating...</div>
          </div>
        )}
      </div>
    );
  };

  const stopGeneration = async () => {
    if (chat.status !== 'streaming') return;

    // Use our chat hook to stop generation
    chat.stop();
  };

  if (
    isApiKeyLoading ||
    isGoogleApiKeyLoading ||
    isBraveSearchApiKeyLoading ||
    isContext7ApiKeyLoading ||
    isModelLoading ||
    isInitialDataLoading
  ) {
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
        <p className="mb-2 text-sm text-muted-foreground">
          Optional: add a Google Gemini API key to unlock Gemini models.
        </p>
        <input
          value={googleKeyInput}
          onChange={e => setGoogleKeyInput(e.target.value)}
          className="border p-2 mb-4"
          placeholder="Gemini API Key (optional)"
          type="password"
        />
        <p className="mb-2 text-sm text-muted-foreground">
          Optional: add a Brave Search API key to enable the Brave Search tool.
        </p>
        <input
          value={braveKeyInput}
          onChange={e => setBraveKeyInput(e.target.value)}
          className="border p-2 mb-4"
          placeholder="Brave Search API Key (optional)"
          type="password"
        />
        <p className="mb-2 text-sm text-muted-foreground">
          Optional: add a Context7 API key to enable pulling contextual docs via Context7.
        </p>
        <input
          value={context7KeyInput}
          onChange={e => setContext7KeyInput(e.target.value)}
          className="border p-2 mb-4"
          placeholder="Context7 API Key (optional)"
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
                <SettingsMenu
                  apiKey={apiKey}
                  googleApiKey={googleApiKey}
                  braveSearchApiKey={braveSearchApiKey}
                  context7ApiKey={context7ApiKey}
                  onSaveKeys={handleSaveKeys}
                  onClear={clearSettings}
                  enabledTools={enabledToolIds ?? DEFAULT_ENABLED_TOOL_IDS}
                  onToggleTool={handleToggleTool}
                />
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

               {/* Error display */}
               {chat.error && (
                 <div className="border-t bg-destructive/10 p-4">
                   <div className="flex items-center justify-between gap-4">
                     <div className="flex items-center gap-2">
                       <div className="size-4 rounded-full bg-destructive"></div>
                       <span className="text-sm text-destructive font-medium">
                         Error: {chat.error?.error || chat.error?.message || 'Something went wrong'}
                       </span>
                     </div>
                     <div className="flex items-center gap-2">
                       <button
                         type="button"
                         onClick={() => chat.reload()}
                         className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3"
                       >
                         Retry
                       </button>
                       <button
                         type="button"
                         onClick={() => chat.clearError()}
                         className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-8 px-3"
                       >
                         Dismiss
                       </button>
                       <button
                         type="button"
                         onClick={() => chat.resetChatState()}
                         className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-muted text-muted-foreground hover:bg-muted/80 h-8 px-3"
                       >
                         Reset Chat
                       </button>
                     </div>
                   </div>
                 </div>
               )}

               {/* Prompt input - fixed at bottom */}
                <div className="border-t bg-background p-4">
                   <PromptInput onSubmit={handleSend} accept="image/*" multiple globalDrop>
                     <PromptInputBody>
                        {attachedContextSnippets.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-2">
                            {attachedContextSnippets.map((snippet) => {
                              const displayText =
                                snippet.text.length > 120
                                  ? `${snippet.text.slice(0, 120)}…`
                                  : snippet.text;
                              return (
                                <div
                                  key={snippet.id}
                                  className="flex items-center gap-1 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-foreground"
                                >
                                  <span className="max-w-[240px] truncate">{displayText}</span>
                                  <button
                                    type="button"
                                    className="flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                    aria-label="Remove attached context"
                                    onClick={() => removeContextSnippet(snippet.id)}
                                  >
                                    <X className="size-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <PromptInputAttachments>
                         {(attachment) => (
                           <PromptInputAttachment data={attachment} />
                         )}
                       </PromptInputAttachments>
                       <PromptInputTextarea
          inputRef={inputRef}
          disabled={chat.status === 'error'}
        />
                     </PromptInputBody>
                    <PromptInputFooter>
                      <PromptInputTools>
                        <PromptInputActionMenu>
                          <PromptInputActionMenuTrigger />
                          <PromptInputActionMenuContent>
                            <PromptInputActionAddAttachments />
                          </PromptInputActionMenuContent>
                        </PromptInputActionMenu>
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
                       <PromptInputSubmit status={currentChatStatus} onStop={stopGeneration} />
                    </PromptInputFooter>
                  </PromptInput>
                </div>
            </div>
           </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
