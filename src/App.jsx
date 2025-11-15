import React, { useRef, useCallback, useEffect, useMemo } from 'react';
import { Plus, BrainIcon, SearchIcon, X } from 'lucide-react';
import { useStorage } from './hooks/useStorage.js';
import { useApiKeyInputs } from './hooks/useApiKeyInputs.js';
import { useUnhandledRejectionHandler } from './hooks/useUnhandledRejectionHandler.js';
import { useConversationLifecycle } from './hooks/useConversationLifecycle.js';
import {
  MODELS,
  PROVIDER_TYPES,
  DEFAULT_MODEL_PREFERENCES,
  DEFAULT_ENABLED_MODEL_IDS,
} from './utils/constants.js';
import { hasAnyProviderKey as hasAnyProviderKeyConfigured } from '@/utils/models.ts';
import { TOOL_DEFINITIONS, DEFAULT_ENABLED_TOOL_IDS } from './services/ai/tools/index';

import { ThemeProvider } from './contexts/ThemeProvider.jsx';
import { ChatStoreProvider, useChatStore } from './contexts/ChatStore.jsx';
import { InitialSetupScreen } from './components/setup/InitialSetupScreen.jsx';

import { useStreamingChat } from './hooks/useStreamingChat.js';
import {
  createChat,
  loadChatMessages,
  saveChatMessages,
  deleteChat,
  setCurrentChatId,
} from './utils/chatStorage.js';
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






function AppContent() {
  const [apiKey, setApiKey, isApiKeyLoading] = useStorage('apiKey', '');
  const [googleApiKey, setGoogleApiKey, isGoogleApiKeyLoading] = useStorage('googleApiKey', '');
  const [braveSearchApiKey, setBraveSearchApiKey, isBraveSearchApiKeyLoading] = useStorage('braveSearchApiKey', '');
  const [context7ApiKey, setContext7ApiKeyStorage, isContext7ApiKeyLoading] = useStorage('context7ApiKey', '');
  const [openRouterApiKey, setOpenRouterApiKey, isOpenRouterApiKeyLoading] = useStorage('openRouterApiKey', '');
  const [anthropicApiKey, setAnthropicApiKey, isAnthropicApiKeyLoading] = useStorage('anthropicApiKey', '');
  const [openaiApiKey, setOpenaiApiKey, isOpenaiApiKeyLoading] = useStorage('openaiApiKey', '');
  const [selectedModelId, setSelectedModelId, isModelLoading] = useStorage('selectedModelId', MODELS[0].id);
  const [modelPreferences, setModelPreferences] = useStorage('modelPreferences', DEFAULT_MODEL_PREFERENCES);
  const customModels = modelPreferences?.customModels ?? [];
  const availableModels = useMemo(() => [...MODELS, ...customModels], [customModels]);
  const enabledModelIds = Array.isArray(modelPreferences?.enabledModelIds)
    ? modelPreferences.enabledModelIds
    : DEFAULT_ENABLED_MODEL_IDS;
  const enabledModels = useMemo(
    () => availableModels.filter((model) => enabledModelIds.includes(model.id)),
    [availableModels, enabledModelIds]
  );
  const selectedModel =
    enabledModels.find((model) => model.id === selectedModelId) ??
    enabledModels[0] ??
    availableModels[0] ??
    MODELS[0];

  const modelOptions = enabledModels.length > 0 ? enabledModels : availableModels;

  useEffect(() => {
    if (enabledModels.length === 0) {
      return;
    }

    if (!enabledModels.some((model) => model.id === selectedModelId)) {
      setSelectedModelId(enabledModels[0].id);
    }
  }, [enabledModels, selectedModelId, setSelectedModelId]);
  const [enabledToolIds, setEnabledToolIds] = useStorage('enabledTools', DEFAULT_ENABLED_TOOL_IDS);
  const inputRef = useRef(null);
  const {
    chatsData,
    currentChatId,
    isInitialDataLoading,
    setChatsData,
    setCurrentChatIdState,
    createNewChat,
    switchChat,
    deleteChatById,
  } = useChatStore();
  const {
    inputs,
    updateInput: updateKeyInput,
    setInputsState: setKeyInputsState,
  } = useApiKeyInputs({
    apiKey,
    googleApiKey,
    braveSearchApiKey,
    context7ApiKey,
    openRouterApiKey,
    anthropicApiKey,
    openaiApiKey,
  });
  const {
    apiKey: keyInput,
    googleApiKey: googleKeyInput,
    braveSearchApiKey: braveKeyInput,
    context7ApiKey: context7KeyInput,
    openRouterApiKey: openRouterKeyInput,
    anthropicApiKey: anthropicKeyInput,
    openaiApiKey: openaiKeyInput,
  } = inputs;
  const providerApiKeys = useMemo(
    () => ({
      openCode: apiKey,
      google: googleApiKey,
      openRouter: openRouterApiKey,
      anthropic: anthropicApiKey,
      openai: openaiApiKey,
    }),
    [apiKey, googleApiKey, openRouterApiKey, anthropicApiKey, openaiApiKey]
  );
  const hasAnyProviderKey = hasAnyProviderKeyConfigured(providerApiKeys);

  useUnhandledRejectionHandler({
    currentChatId,
    chatsData,
    setChatsData,
  });

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

  // Use our custom streaming chat hook
  const chat = useStreamingChat({
    currentChatId,
    chatsData,
    setChatsData,
    apiKey,
    googleApiKey,
    braveSearchApiKey,
    context7ApiKey,
    openRouterApiKey,
    anthropicApiKey,
    openaiApiKey,
    selectedModel,
    enabledToolIds,
    onError: (errorForUI) => {
      console.error('Chat error in useStreamingChat:', errorForUI);
      // You can add additional error handling here if needed
    }
  });

  // The useStreamingChat hook handles updating chatsData internally

  // Derived state from chatsData
  const chats = Object.values(chatsData).map(c => c.metadata).sort((a, b) => b.updatedAt - a.updatedAt);
  const currentChatMessages = chat.messages || [];
  const currentChatStatus = chat.status;

  const {
    attachedContextSnippets,
    handleSend,
    removeContextSnippet,
  } = useConversationLifecycle({
    chat,
    currentChatId,
    createNewChat,
    selectedModel,
    apiKey,
    googleApiKey,
    openRouterApiKey,
    anthropicApiKey,
    openaiApiKey,
    inputRef,
    isInitialDataLoading,
  });

  const saveSettings = () => {
    setApiKey(keyInput);
    setGoogleApiKey(googleKeyInput);
    setBraveSearchApiKey(braveKeyInput);
    setContext7ApiKeyStorage(context7KeyInput);
    setOpenRouterApiKey(openRouterKeyInput);
    setAnthropicApiKey(anthropicKeyInput);
    setOpenaiApiKey(openaiKeyInput);
    setSelectedModelId(selectedModel.id);
  };

  const handleSaveKeys = (
    newApiKey,
    newGoogleApiKey,
    newBraveSearchApiKey,
    newContext7ApiKey,
    newOpenRouterApiKey,
    newAnthropicApiKey,
    newOpenaiApiKey
  ) => {
    setApiKey(newApiKey);
    setGoogleApiKey(newGoogleApiKey);
    setBraveSearchApiKey(newBraveSearchApiKey);
    setContext7ApiKeyStorage(newContext7ApiKey);
    setOpenRouterApiKey(newOpenRouterApiKey);
    setAnthropicApiKey(newAnthropicApiKey);
    setOpenaiApiKey(newOpenaiApiKey);
  };

  const handleSetupInputChange = useCallback(
    (field) => (event) => {
      updateKeyInput(field, event.target.value);
    },
    [updateKeyInput]
  );

  const changeModel = (modelId) => {
    if (enabledModels.some((model) => model.id === modelId)) {
      setSelectedModelId(modelId);
    }
  };

  const toggleModelAvailability = useCallback(
    (modelId, enabled) => {
      setModelPreferences((prev = DEFAULT_MODEL_PREFERENCES) => {
        const prevEnabled = Array.isArray(prev.enabledModelIds)
          ? prev.enabledModelIds
          : DEFAULT_ENABLED_MODEL_IDS;
        const nextEnabled = enabled
          ? Array.from(new Set([...prevEnabled, modelId]))
          : prevEnabled.filter((id) => id !== modelId);

        return {
          ...prev,
          enabledModelIds: nextEnabled
        };
      });
    },
    [setModelPreferences]
  );

  const addCustomModel = useCallback(
    (modelDefinition) => {
      if (!modelDefinition?.id) {
        return;
      }

      const newModel = {
        ...modelDefinition,
        id: modelDefinition.id.trim(),
        name: modelDefinition.name.trim()
      };

      if (!newModel.id || !newModel.name) {
        return;
      }

      setModelPreferences((prev = DEFAULT_MODEL_PREFERENCES) => {
        const prevCustoms = prev.customModels ?? [];
        const withoutDuplicate = prevCustoms.filter((model) => model.id !== newModel.id);
        const updatedCustoms = [...withoutDuplicate, newModel];
        const prevEnabled = Array.isArray(prev.enabledModelIds)
          ? prev.enabledModelIds
          : DEFAULT_ENABLED_MODEL_IDS;
        const nextEnabled = Array.from(new Set([...prevEnabled, newModel.id]));

        return {
          ...prev,
          customModels: updatedCustoms,
          enabledModelIds: nextEnabled
        };
      });
    },
    [setModelPreferences]
  );

  const clearSettings = () => {
    chrome.storage.sync.clear();
    chrome.storage.local.clear();
    setApiKey('');
    setGoogleApiKey('');
    setBraveSearchApiKey('');
    setContext7ApiKeyStorage('');
    setOpenRouterApiKey('');
    setAnthropicApiKey('');
    setOpenaiApiKey('');
    setKeyInputsState({
      apiKey: '',
      googleApiKey: '',
      braveSearchApiKey: '',
      context7ApiKey: '',
      openRouterApiKey: '',
      anthropicApiKey: '',
      openaiApiKey: '',
    });
    setSelectedModelId(
      DEFAULT_MODEL_PREFERENCES.enabledModelIds[0] ?? MODELS[0].id
    );
    setModelPreferences({
      enabledModelIds: [...DEFAULT_MODEL_PREFERENCES.enabledModelIds],
      customModels: []
    });
    setChatsData({});
    setCurrentChatIdState(null);
  };

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
    isOpenRouterApiKeyLoading ||
    isAnthropicApiKeyLoading ||
    isModelLoading ||
    isInitialDataLoading
  ) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-sidebar text-sidebar-foreground">
        <div className="rounded-2xl border border-sidebar-border/60 bg-card px-6 py-5 text-sm text-muted-foreground">
          Loading your sidebar configuration…
        </div>
      </div>
    );
  }

  if (!hasAnyProviderKey) {
    return (
      <InitialSetupScreen
        inputs={inputs}
        onInputChange={handleSetupInputChange}
        onSave={saveSettings}
      />
    );
  }

  return (
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
                  openRouterApiKey={openRouterApiKey}
                  anthropicApiKey={anthropicApiKey}
                  openaiApiKey={openaiApiKey}
                  onSaveKeys={handleSaveKeys}
                  onClear={clearSettings}
                  enabledTools={enabledToolIds ?? DEFAULT_ENABLED_TOOL_IDS}
                  onToggleTool={handleToggleTool}
                  models={availableModels}
                  enabledModelIds={enabledModelIds}
                  onToggleModel={toggleModelAvailability}
                  onAddCustomModel={addCustomModel}
                  providerTypes={PROVIDER_TYPES}
                />
              </div>
            </div>
        </header>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <Conversation className="h-full">
              <ConversationContent className="p-4">
                {currentChatMessages.length === 0 ? (
                  <div className="flex size-full flex-col items-center justify-center gap-3 p-8 text-center">
                    <div className="space-y-1">
                      <h3 className="font-medium text-sm">No messages yet</h3>
                      <p className="text-muted-foreground text-sm">
                        Start a conversation to see messages here
                      </p>
                    </div>
                  </div>
                ) : (
                  currentChatMessages.map((msg, i) => (
                    <Branch key={`${currentChatId}-${i}`}>
                      <BranchMessages>
                        <Message from={msg.role}>
                          <MessageContent variant="flat">
                            {renderMessageParts(msg)}
                          </MessageContent>
                        </Message>
                      </BranchMessages>
                    </Branch>
                  ))
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          </div>

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
                  {(attachment) => <PromptInputAttachment data={attachment} />}
                </PromptInputAttachments>
                <PromptInputTextarea inputRef={inputRef} disabled={chat.status === 'error'} />
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
                      {modelOptions.map((model) => (
                        <PromptInputModelSelectItem key={model.id} value={model.id}>
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
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ChatStoreProvider>
        <AppContent />
      </ChatStoreProvider>
    </ThemeProvider>
  );
}
