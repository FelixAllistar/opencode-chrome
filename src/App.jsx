import React, { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import { useStorage } from './hooks/useStorage.js';
import { useApiKeyInputs } from './hooks/useApiKeyInputs.js';
import { useUnhandledRejectionHandler } from './hooks/useUnhandledRejectionHandler.js';
import { useConversationLifecycle } from './hooks/useConversationLifecycle.js';
import { useModelConfig } from './hooks/useModelConfig.js';
import {
  MODELS,
  PROVIDER_TYPES,
  DEFAULT_MODEL_PREFERENCES,
  DEFAULT_ENABLED_MODEL_IDS,
} from './utils/constants.js';
import { hasAnyProviderKey as hasAnyProviderKeyConfigured } from '@/utils/models.ts';
import { TOOL_DEFINITIONS, DEFAULT_ENABLED_TOOL_IDS } from './services/ai/tools/index';
import { useOpenCodeClient } from './hooks/useOpenCodeClient.js';
import { useOpenCodeProjects, LOAD_STATUS as LOAD_STATUS_OPENCODE } from './hooks/useOpenCodeProjects.js';
import { useOpenCodeSessions } from './hooks/useOpenCodeSessions.js';
import { useOpenCodeSession } from './hooks/useOpenCodeSession.js';
import { useOpenCodeTuiControls } from './hooks/useOpenCodeTuiControls.js';

import { ThemeProvider } from './contexts/ThemeProvider.jsx';
import { ChatStoreProvider, useChatStore } from './contexts/ChatStore.jsx';
import { InitialSetupScreen } from './components/setup/InitialSetupScreen.jsx';

import { useStreamingChat } from './hooks/useStreamingChat.js';
import { AppSidebar } from './components/app-sidebar.jsx';
import {
  SidebarProvider,
  SidebarInset,
} from './components/ui/sidebar.jsx';
import { cn } from '@/lib/utils';
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
  MessageContent,
} from './components/ai-elements/message.tsx';
import { MessageParts } from './components/ai-elements/message-parts.tsx';
import { AppHeader } from './components/AppHeader.jsx';
import { ChatFooter } from './components/ChatFooter.jsx';

function AppContent() {
  const [apiKey, setApiKey, isApiKeyLoading] = useStorage('apiKey', '');
  const [googleApiKey, setGoogleApiKey, isGoogleApiKeyLoading] = useStorage('googleApiKey', '');
  const [braveSearchApiKey, setBraveSearchApiKey, isBraveSearchApiKeyLoading] = useStorage('braveSearchApiKey', '');
  const [context7ApiKey, setContext7ApiKeyStorage, isContext7ApiKeyLoading] = useStorage('context7ApiKey', '');
  const [openRouterApiKey, setOpenRouterApiKey, isOpenRouterApiKeyLoading] = useStorage('openRouterApiKey', '');
  const [anthropicApiKey, setAnthropicApiKey, isAnthropicApiKeyLoading] = useStorage('anthropicApiKey', '');
  const [openaiApiKey, setOpenaiApiKey, isOpenaiApiKeyLoading] = useStorage('openaiApiKey', '');
  const [opencodeBaseUrl, setOpencodeBaseUrl] = useStorage('opencodeBaseUrl', 'http://localhost:6969');
  const [
    lastOpencodeProjectId,
    setLastOpencodeProjectId,
    isLastOpencodeProjectIdLoading
  ] = useStorage('opencodeLastProjectId', null);
  const [
    lastOpencodeSessionId,
    setLastOpencodeSessionId,
    isLastOpencodeSessionIdLoading
  ] = useStorage('opencodeLastSessionId', null);
  const [mode, setMode] = useStorage('chatMode', 'browser');
  const isDevMode = mode === 'opencode';
  const {
    selectedModel,
    selectedModelId,
    modelOptions,
    enabledModelIds,
    customModels,
    modelPreferences,
    isModelLoading,
    changeModel,
    toggleModelAvailability,
    removeCustomModel,
    addCustomModel,
    setSelectedModelId,
    setModelPreferences,
    availableModels,
  } = useModelConfig();
  const [enabledToolIds, setEnabledToolIds] = useStorage('enabledTools', DEFAULT_ENABLED_TOOL_IDS);
  const inputRef = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const previousProjectIdRef = useRef(null);
  const [devActionBanner, setDevActionBanner] = useState(null);
  const {
    chatsData,
    currentChatId,
    isInitialDataLoading,
    setChatsData,
    setCurrentChatIdState,
    createNewChat,
    switchChat,
    deleteChatById,
    deleteChatsByIds,
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

  // OpenCode server wiring (Dev mode)
  const { client: opencodeClient } = useOpenCodeClient({
    baseUrl: opencodeBaseUrl,
    active: isDevMode
  });

  const {
    projects: opencodeProjects,
    status: opencodeProjectsStatus,
    error: opencodeProjectsError,
    refresh: refreshOpencodeProjects
  } = useOpenCodeProjects({
    client: opencodeClient,
    active: isDevMode,
    baseUrl: opencodeBaseUrl
  });

  const {
    sessions: opencodeSessions,
    status: opencodeSessionsStatus,
    error: opencodeSessionsError,
    refresh: refreshOpencodeSessions,
    createSession: createOpencodeSession,
    deleteSessionById: deleteOpencodeSessionById
  } = useOpenCodeSessions({
    client: opencodeClient,
    project: selectedProject,
    active: isDevMode,
    baseUrl: opencodeBaseUrl
  });

  const devChat = useOpenCodeSession({
    client: opencodeClient,
    project: selectedProject,
    session: selectedSession,
    active: isDevMode,
    onSessionChange: setSelectedSession
  });

  const tuiControls = useOpenCodeTuiControls({
    client: opencodeClient,
    active: isDevMode
  });

  const formatOpencodeError = useCallback((err) => {
    if (!err) return null;
    return err?.message || err?.data?.message || err?.error || 'OpenCode error';
  }, []);

  const isOpencodeOffline = useMemo(
    () =>
      isDevMode &&
      (opencodeProjectsStatus === LOAD_STATUS_OPENCODE.ERROR ||
        opencodeSessionsStatus === LOAD_STATUS_OPENCODE.ERROR),
    [isDevMode, opencodeProjectsStatus, opencodeSessionsStatus]
  );

  const devStatusMessage = useMemo(() => {
    if (!isDevMode) return null;
    if (isOpencodeOffline) {
      return (
        formatOpencodeError(opencodeProjectsError || opencodeSessionsError) ||
        'OpenCode is not reachable. Start the server and retry.'
      );
    }
    if (
      opencodeProjectsStatus === LOAD_STATUS_OPENCODE.LOADING ||
      opencodeSessionsStatus === LOAD_STATUS_OPENCODE.LOADING
    ) {
      return 'Connecting to OpenCode…';
    }
    if (!selectedProject) return 'Select a project to chat with OpenCode.';
    if (!selectedSession && opencodeSessionsStatus === LOAD_STATUS_OPENCODE.READY && opencodeSessions.length === 0) {
      return 'No sessions yet in this project. Create one to start chatting.';
    }
    if (opencodeProjectsError) return formatOpencodeError(opencodeProjectsError);
    if (opencodeSessionsError) return formatOpencodeError(opencodeSessionsError);
    return null;
  }, [
    formatOpencodeError,
    isDevMode,
    isOpencodeOffline,
    opencodeProjectsStatus,
    opencodeProjectsError,
    opencodeSessionsError,
    opencodeSessions.length,
    opencodeSessionsStatus,
    selectedProject,
    selectedSession
  ]);

  useEffect(() => {
    if (!isDevMode) return;
    const nextProjectId = selectedProject?.id || null;
    const prevProjectId = previousProjectIdRef.current;
    // Only clear session state when we move between two concrete projects.
    if (nextProjectId && prevProjectId && nextProjectId !== prevProjectId) {
      setSelectedSession(null);
      if (lastOpencodeSessionId) {
        setLastOpencodeSessionId(null);
      }
    }
    previousProjectIdRef.current = nextProjectId;
  }, [
    isDevMode,
    lastOpencodeSessionId,
    selectedProject?.id,
    setLastOpencodeSessionId
  ]);

  useEffect(() => {
    if (!isDevMode) return;
    if (isLastOpencodeProjectIdLoading) return;
    const nextProjectId = selectedProject?.id || null;
    // Do not overwrite stored value when there is no active project;
    // this would erase the last selection on startup before we restore it.
    if (!nextProjectId) return;
    if (lastOpencodeProjectId === nextProjectId) return;
    setLastOpencodeProjectId(nextProjectId);
  }, [
    isDevMode,
    isLastOpencodeProjectIdLoading,
    lastOpencodeProjectId,
    selectedProject?.id,
    setLastOpencodeProjectId
  ]);

  useEffect(() => {
    if (!isDevMode) return;
    if (isLastOpencodeSessionIdLoading) return;
    const nextSessionId = selectedSession?.id || null;
    // Avoid clearing the stored session when nothing is selected yet;
    // we explicitly clear it when switching projects instead.
    if (!nextSessionId) return;
    if (lastOpencodeSessionId === nextSessionId) return;
    setLastOpencodeSessionId(nextSessionId);
  }, [
    isDevMode,
    isLastOpencodeSessionIdLoading,
    lastOpencodeSessionId,
    selectedSession?.id,
    setLastOpencodeSessionId
  ]);

  const handleRetryOpencode = useCallback(() => {
    refreshOpencodeProjects();
    if (selectedProject) {
      refreshOpencodeSessions();
    }
  }, [refreshOpencodeProjects, refreshOpencodeSessions, selectedProject]);

  useEffect(() => {
    if (!isDevMode) return;
    if (isLastOpencodeProjectIdLoading) return;
    if (opencodeProjectsStatus !== LOAD_STATUS_OPENCODE.READY) return;
    if (selectedProject?.id) return;

    if (lastOpencodeProjectId) {
      const storedProject = opencodeProjects.find((p) => p.id === lastOpencodeProjectId);
      if (storedProject) {
        setSelectedProject(storedProject);
        return;
      }
    }

    if (!selectedProject && opencodeProjects.length > 0) {
      setSelectedProject(opencodeProjects[0]);
    }
  }, [
    isDevMode,
    isLastOpencodeProjectIdLoading,
    lastOpencodeProjectId,
    opencodeProjects,
    opencodeProjectsStatus,
    selectedProject?.id
  ]);

  useEffect(() => {
    if (!isDevMode) return;
    if (isLastOpencodeSessionIdLoading) return;
    if (!selectedProject?.id) return;
    if (opencodeSessionsStatus !== LOAD_STATUS_OPENCODE.READY) return;
    if (selectedSession?.id) return;

    if (lastOpencodeSessionId) {
      const storedSession = opencodeSessions.find((s) => s.id === lastOpencodeSessionId);
      if (storedSession) {
        setSelectedSession(storedSession);
        return;
      }
    }

    if (opencodeSessions.length > 0) {
      setSelectedSession(opencodeSessions[0]);
    }
  }, [
    isDevMode,
    isLastOpencodeSessionIdLoading,
    lastOpencodeSessionId,
    opencodeSessions,
    opencodeSessionsStatus,
    selectedProject?.id,
    selectedSession?.id
  ]);

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

  // Browser mode chat (AI SDK)
  const browserChat = useStreamingChat({
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

  const chat = isDevMode ? devChat : browserChat;

  // The useStreamingChat hook handles updating chatsData internally

  // Derived state from chatsData
  const browserChats = useMemo(
    () =>
      Object.values(chatsData)
        .map((c) => c.metadata)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [chatsData]
  );
  const devSidebarItems = useMemo(
    () =>
      opencodeSessions.map((session) => ({
        id: session.id,
        title: session.title || 'Session',
        createdAt: session.createdAt || session.updatedAt || Date.now(),
        updatedAt: session.updatedAt || session.createdAt || Date.now(),
        messageCount: session.messageCount ?? 0,
        lastMessage: session.lastMessage ?? '',
        mode: 'opencode',
        opencode: {
          baseUrl: opencodeBaseUrl,
          projectId: session.projectId,
          projectWorktree: session.directory,
          sessionId: session.id,
          directory: session.directory
        }
      })),
    [opencodeSessions, opencodeBaseUrl]
  );

  const sidebarChats = isDevMode ? devSidebarItems : browserChats;
  const effectiveCurrentChatId = isDevMode ? selectedSession?.id : currentChatId;
  const currentSidebarChat = sidebarChats.find((chat) => chat.id === effectiveCurrentChatId);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState([]);

  useEffect(() => {
    if (isDevMode) {
      setIsSelectionMode(false);
      setSelectedChatIds([]);
      return;
    }
    setSelectedChatIds((prev) => {
      const nextSelection = prev.filter((id) => sidebarChats.some((chat) => chat.id === id));
      return nextSelection.length === prev.length ? prev : nextSelection;
    });
  }, [isDevMode, sidebarChats]);

  const isAllSelected = !isDevMode && sidebarChats.length > 0 && selectedChatIds.length === sidebarChats.length;

  const handleToggleSelectionMode = useCallback(() => {
    if (isDevMode) return;
    setIsSelectionMode((prev) => {
      const nextMode = !prev;
      if (!nextMode) {
        setSelectedChatIds([]);
      }
      return nextMode;
    });
  }, [isDevMode]);

  const handleSelectAllChats = useCallback(() => {
    if (isDevMode) return;
    setSelectedChatIds((prev) => {
      if (sidebarChats.length > 0 && prev.length === sidebarChats.length) {
        return [];
      }
      return sidebarChats.map((chat) => chat.id);
    });
  }, [isDevMode, sidebarChats]);

  const handleToggleChatSelection = useCallback((chatId) => {
    setSelectedChatIds((prev) => {
      if (prev.includes(chatId)) {
        return prev.filter((id) => id !== chatId);
      }
      return [...prev, chatId];
    });
  }, []);

  const handleDeleteSelectedChats = useCallback(async () => {
    if (isDevMode) return;
    if (selectedChatIds.length === 0) {
      return;
    }
    await deleteChatsByIds(selectedChatIds);
    setSelectedChatIds([]);
    setIsSelectionMode(false);
  }, [isDevMode, selectedChatIds, deleteChatsByIds]);

  const selectionMode = isDevMode ? false : isSelectionMode;

  const createDevSession = useCallback(async () => {
    if (!selectedProject) return null;
    const newSession = await createOpencodeSession();
    if (newSession) {
      setSelectedSession(newSession);
      return newSession.id;
    }
    return null;
  }, [createOpencodeSession, selectedProject]);

  const effectiveCreateChat = isDevMode ? createDevSession : createNewChat;
  const effectiveIsInitialLoading = isDevMode
    ? opencodeSessionsStatus === LOAD_STATUS_OPENCODE.LOADING
    : isInitialDataLoading;

  const handleSelectSidebarChat = useCallback(
    async (chatId) => {
      if (isDevMode) {
        const target = opencodeSessions.find((session) => session.id === chatId);
        if (target) {
          setSelectedSession(target);
        }
        return;
      }
      await switchChat(chatId);
    },
    [isDevMode, opencodeSessions, switchChat]
  );

  const handleDeleteSidebarChat = useCallback(
    async (chatId) => {
      if (isDevMode) {
        await deleteOpencodeSessionById(chatId);
        if (selectedSession?.id === chatId) {
          setSelectedSession(null);
        }
        return;
      }
      await deleteChatById(chatId);
    },
    [deleteChatById, deleteOpencodeSessionById, isDevMode, selectedSession?.id]
  );

  const handleNewSidebarChat = useCallback(async () => {
    if (isDevMode) {
      await createDevSession();
      return;
    }
    await createNewChat();
  }, [createDevSession, createNewChat, isDevMode]);

  const sendScreenshotToTui = useCallback(async () => {
    if (!isDevMode) return;
    if (!chrome?.tabs?.captureVisibleTab) {
      setDevActionBanner({ type: 'error', text: 'Screenshot capture not available in this browser.' });
      return;
    }
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const imageDataUrl = await chrome.tabs.captureVisibleTab(
        activeTab?.windowId,
        { format: 'png' }
      );
      const url = activeTab?.url || '';
      const title = activeTab?.title || 'Active tab';
      const promptText = `[browser screenshot]\n${title}\n${url}\n\n![screenshot](${imageDataUrl})`;
      await tuiControls.appendToPrompt(promptText);
      setDevActionBanner({ type: 'success', text: 'Screenshot queued to TUI prompt.' });
    } catch (err) {
      console.error('Failed to send screenshot to TUI', err);
      setDevActionBanner({ type: 'error', text: `Failed to send screenshot: ${err?.message || err}` });
    }
  }, [isDevMode, tuiControls]);

  const sendConsoleLogsToTui = useCallback(async () => {
    if (!isDevMode) return;
    if (!chrome?.scripting?.executeScript || !chrome?.tabs?.query) {
      setDevActionBanner({ type: 'error', text: 'Console capture not available in this browser.' });
      return;
    }
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!activeTab?.id) {
        setDevActionBanner({ type: 'error', text: 'No active tab for console logs.' });
        return;
      }

      const [{ result: logs }] = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: () => {
          const key = '__opencodeConsoleBuffer';
          if (!window[key]) {
            window[key] = [];
            const maxLogs = 100;
            ['log', 'warn', 'error', 'info', 'debug'].forEach((level) => {
              const original = console[level];
              console[level] = (...args) => {
                try {
                  window[key].push({
                    level,
                    time: Date.now(),
                    args: args.map((val) => {
                      try {
                        return typeof val === 'string' ? val : JSON.stringify(val);
                      } catch (error) {
                        return String(val);
                      }
                    })
                  });
                  if (window[key].length > maxLogs) {
                    window[key].shift();
                  }
                } catch (error) {
                  // swallow
                }
                return original.apply(console, args);
              };
            });
          }
          return window[key].slice(-50);
        }
      });

      const formatted = (logs || [])
        .map((entry) => {
          const time = entry?.time ? new Date(entry.time).toISOString() : '';
          const level = entry?.level || 'log';
          const text = Array.isArray(entry?.args) ? entry.args.join(' ') : '';
          return `[${time}] ${level}: ${text}`;
        })
        .join('\n');

      const heading = `${activeTab?.title || 'Active tab'}\n${activeTab?.url || ''}`;
      const body = formatted || 'No captured console logs yet. Listener attached for future logs.';
      const promptText = `[browser console]\n${heading}\n\n${body}`;
      await tuiControls.appendToPrompt(promptText);
      setDevActionBanner({ type: 'success', text: 'Console logs queued to TUI prompt.' });
    } catch (err) {
      console.error('Failed to send console logs to TUI', err);
      setDevActionBanner({ type: 'error', text: `Failed to send console logs: ${err?.message || err}` });
    }
  }, [isDevMode, tuiControls]);

  const currentChatMessages = chat.messages || [];
  const currentChatStatus = chat.status;

  const {
    attachedContextSnippets,
    handleSend,
    removeContextSnippet,
  } = useConversationLifecycle({
    chat,
    currentChatId: effectiveCurrentChatId,
    createNewChat: effectiveCreateChat,
    inputRef,
    isInitialDataLoading: effectiveIsInitialLoading,
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
    if (effectiveIsInitialLoading || !effectiveCurrentChatId || !inputRef?.current) {
      return undefined;
    }

    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [effectiveIsInitialLoading, effectiveCurrentChatId, inputRef]);

  const stopGeneration = async () => {
    if (chat.status !== 'streaming') return;

    // Use our chat hook to stop generation
    chat.stop();
  };

  const handleProjectChange = useCallback(
    (projectId) => {
      const nextProject = opencodeProjects.find((project) => project.id === projectId);
      setSelectedProject(nextProject || null);
      setSelectedSession(null);
    },
    [opencodeProjects]
  );

  const handleSessionChange = useCallback(
    (sessionId) => {
      const target = opencodeSessions.find((session) => session.id === sessionId);
      setSelectedSession(target || null);
    },
    [opencodeSessions]
  );

  const isBaseSettingsLoading =
    isApiKeyLoading ||
    isGoogleApiKeyLoading ||
    isBraveSearchApiKeyLoading ||
    isContext7ApiKeyLoading ||
    isOpenRouterApiKeyLoading ||
    isAnthropicApiKeyLoading ||
    isModelLoading;

  const isAppLoading = isDevMode
    ? isBaseSettingsLoading
    : isBaseSettingsLoading || isInitialDataLoading;

  if (isAppLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-sidebar text-sidebar-foreground">
        <div className="rounded-2xl border border-sidebar-border/60 bg-card px-6 py-5 text-sm text-muted-foreground">
          Loading your sidebar configuration…
        </div>
      </div>
    );
  }

  if (!hasAnyProviderKey && !isDevMode) {
    return (
      <InitialSetupScreen
        inputs={inputs}
        onInputChange={handleSetupInputChange}
        onSave={saveSettings}
      />
    );
  }

  const settingsMenuProps = {
    apiKey,
    googleApiKey,
    braveSearchApiKey,
    context7ApiKey,
    openRouterApiKey,
    anthropicApiKey,
    openaiApiKey,
    onSaveKeys: handleSaveKeys,
    onClear: clearSettings,
    enabledTools: enabledToolIds ?? DEFAULT_ENABLED_TOOL_IDS,
    onToggleTool: handleToggleTool,
    models: availableModels,
    enabledModelIds,
    onToggleModel: toggleModelAvailability,
    onAddCustomModel: addCustomModel,
    customModels,
    onDeleteCustomModel: removeCustomModel,
    providerTypes: PROVIDER_TYPES,
  };

  return (
    <SidebarProvider>
      <AppSidebar
        chats={sidebarChats}
        currentChatId={effectiveCurrentChatId}
        selectedChatIds={selectedChatIds}
        selectionMode={selectionMode}
        onNewChat={handleNewSidebarChat}
        onSelectChat={handleSelectSidebarChat}
        onDeleteChat={handleDeleteSidebarChat}
        onToggleSelectionMode={handleToggleSelectionMode}
        onToggleChatSelection={handleToggleChatSelection}
        onDeleteSelectedChats={isDevMode ? () => {} : handleDeleteSelectedChats}
        onSelectAllChats={isDevMode ? () => {} : handleSelectAllChats}
        isAllSelected={isDevMode ? false : isAllSelected}
      />
      <SidebarInset className="h-screen flex flex-col">
        <AppHeader
          isDevMode={isDevMode}
          onSelectMode={setMode}
          onNewChat={handleNewSidebarChat}
          currentChatTitle={currentSidebarChat ? currentSidebarChat.title : 'No Chat'}
          opencodeBaseUrl={opencodeBaseUrl}
          onChangeOpencodeBaseUrl={setOpencodeBaseUrl}
          opencodeProjects={opencodeProjects}
          selectedProjectId={selectedProject?.id || null}
          onProjectChange={handleProjectChange}
          opencodeSessions={opencodeSessions}
          selectedSessionId={selectedSession?.id || null}
          onSessionChange={handleSessionChange}
          onSendConsoleLogs={sendConsoleLogsToTui}
          onSendScreenshot={sendScreenshotToTui}
          settingsMenuProps={settingsMenuProps}
        />
        {isDevMode && (devStatusMessage || devActionBanner) && (
          <div className="mx-4 mt-2 space-y-2">
            {devStatusMessage && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>{devStatusMessage}</span>
                  {isOpencodeOffline && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={handleRetryOpencode}
                      >
                        Retry connection
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {devActionBanner && (
              <div
                className={cn(
                  'rounded-md px-3 py-2 text-sm',
                  devActionBanner.type === 'success'
                    ? 'border border-emerald-600/40 bg-emerald-500/10 text-emerald-700'
                    : 'border border-destructive/40 bg-destructive/10 text-destructive'
                )}
              >
                {devActionBanner.text}
              </div>
            )}
          </div>
        )}
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
                    <Branch key={`${effectiveCurrentChatId || 'dev'}-${i}`}>
                      <BranchMessages>
                        <Message from={msg.role}>
                          <MessageContent variant="flat">
                            <MessageParts message={msg} />
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

          <ChatFooter
            attachedContextSnippets={attachedContextSnippets}
            onRemoveContextSnippet={removeContextSnippet}
            inputRef={inputRef}
            onSubmit={handleSend}
            isDevMode={isDevMode}
            selectedModelId={selectedModelId}
            modelOptions={modelOptions}
            onChangeModel={changeModel}
            chatStatus={currentChatStatus}
            onStop={stopGeneration}
          />
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
