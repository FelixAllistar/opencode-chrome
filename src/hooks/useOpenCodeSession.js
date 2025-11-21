import { useCallback, useEffect, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import { LOAD_STATUS } from './useOpenCodeProjects.js';

const READY = 'ready';
const ERROR = 'error';
const SUBMITTED = 'submitted';

const DEFAULT_FILE_MIME = 'application/octet-stream';

const formatErrorText = (err) => {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (err?.data?.message) return err.data.message;
  if (err?.message) return err.message;
  if (err?.error) return err.error;
  try {
    return JSON.stringify(err);
  } catch (jsonError) {
    return 'Unknown error';
  }
};

const mapPartToUi = (part) => {
  switch (part.type) {
    case 'text':
      return { type: 'text', text: part.text };
    case 'reasoning':
      return { type: 'reasoning', text: part.text };
    case 'step-start':
      return { type: 'reasoning', text: part.text || 'Thinking…' };
    case 'step-finish':
      return {
        type: 'reasoning',
        text: part.text || part.reason || 'Completed step'
      };
    case 'file':
      return {
        type: 'file',
        url: part.url,
        mediaType: part.mime,
        filename: part.filename
      };
    case 'tool':
      return {
        type: `tool-${part.tool}`,
        state: part.state?.status,
        input: part.state?.input,
        output: part.state?.output,
        toolCallId: part.callID
      };
    default:
      // Step/patch/agent/retry/etc. land here for debugging visibility
      return { type: part.type, ...part };
  }
};

const mapMessageToUi = (entry) => {
  const role = entry?.info?.role === 'assistant' ? 'assistant' : 'user';
  const baseParts = Array.isArray(entry?.parts) ? entry.parts.map(mapPartToUi) : [];
  const errorPart =
    entry?.info?.error != null
      ? [{ type: 'text', text: formatErrorText(entry.info.error) }]
      : [];

  return {
    id: entry?.info?.id || nanoid(),
    role,
    parts: [...baseParts, ...errorPart],
    status: entry?.info?.error ? ERROR : READY
  };
};

const toFilePartInput = (file) => ({
  type: 'file',
  mime: file.mediaType || DEFAULT_FILE_MIME,
  filename: file.filename,
  url: file.url
});

/**
 * OpenCode-backed chat controller that mirrors the `useStreamingChat` shape.
 */
export function useOpenCodeSession({
  client,
  project,
  session,
  active,
  onSessionChange
}) {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState(READY);
  const [error, setError] = useState(null);
  const [loadStatus, setLoadStatus] = useState(LOAD_STATUS.IDLE);

  const directory = session?.directory || project?.worktree;

const mapError = useCallback((err, kind = 'api') => {
  if (!err) return null;
  const message =
    err?.data?.message ||
    err?.message ||
    err?.error ||
    'Something went wrong';
  return { kind, message, error: message, underlying: err };
}, []);

  const ensureSession = useCallback(async () => {
    if (!client) {
      throw new Error('OpenCode client not available');
    }
    if (!project?.worktree) {
      throw new Error('Select a project before chatting');
    }
    if (session) return session;

    const res = await client.session.create({
      query: { directory: project.worktree }
    });
    if (res.error || !res.data) {
      throw res.error || new Error('Failed to create session');
    }
    const created = {
      id: res.data.id,
      projectId: res.data.projectID,
      directory: res.data.directory,
      title: res.data.title,
      createdAt: res.data.time?.created,
      updatedAt: res.data.time?.updated
    };
    onSessionChange?.(created);
    return created;
  }, [client, project, session, onSessionChange]);

  const loadMessages = useCallback(async () => {
    if (!client || !session || !directory || !active) return;
    setLoadStatus(LOAD_STATUS.LOADING);
    try {
      const res = await client.session.messages({
        path: { id: session.id },
        query: { directory }
      });
      if (res.error) {
        setError(mapError(res.error));
        setMessages((prev) => [
          ...prev,
          {
            id: nanoid(),
            role: 'assistant',
            parts: [{ type: 'text', text: formatErrorText(res.error) }],
            status: ERROR
          }
        ]);
        setLoadStatus(LOAD_STATUS.ERROR);
        return;
      }
      const data = Array.isArray(res.data) ? res.data : [];
      setMessages(data.map(mapMessageToUi));
      setLoadStatus(LOAD_STATUS.READY);
    } catch (err) {
      setError(mapError(err));
      setMessages((prev) => [
        ...prev,
        {
          id: nanoid(),
          role: 'assistant',
          parts: [{ type: 'text', text: formatErrorText(err) }],
          status: ERROR
        }
      ]);
      setLoadStatus(LOAD_STATUS.ERROR);
    }
  }, [active, client, directory, session, mapError]);

  useEffect(() => {
    if (!active) {
      setMessages([]);
      setStatus(READY);
      setError(null);
      return;
    }
    if (session) {
      void loadMessages();
    }
  }, [active, session, loadMessages]);

  // Streaming updates via /event
  useEffect(() => {
    if (!active || !client || !session?.id || !directory) return undefined;
    let canceled = false;
    const subscribe = async () => {
      try {
        const events = await client.event.subscribe({
          query: { directory }
        });
        for await (const event of events.stream) {
          if (canceled) break;
          // Only handle events for this session when possible
          const evtSessionId =
            event?.properties?.sessionID ||
            event?.properties?.info?.sessionID ||
            event?.properties?.part?.sessionID;
          if (evtSessionId && evtSessionId !== session.id) {
            continue;
          }

          switch (event?.type) {
            case 'message.part.updated': {
              const part = event.properties?.part;
              const delta = event.properties?.delta;
              if (!part?.messageID) break;
              const uiPart = mapPartToUi(part);
              setMessages((prev) => {
                const next = [...prev];
                const idx = next.findIndex((m) => m.id === part.messageID);
                if (idx === -1) {
                  next.push({
                    id: part.messageID,
                    role: 'assistant',
                    parts: [uiPart],
                    status: SUBMITTED
                  });
                  return next;
                }
                const message = next[idx];
                const parts = message.parts ? [...message.parts] : [];
                const partIdx = parts.findIndex((p) => p.id === uiPart.id || p.toolCallId === uiPart.toolCallId);
                if (uiPart.type === 'text' && typeof delta === 'string') {
                  // Append delta to existing text part if present
                  if (partIdx >= 0 && typeof parts[partIdx].text === 'string') {
                    parts[partIdx] = { ...parts[partIdx], text: parts[partIdx].text + delta };
                  } else {
                    parts.push({ ...uiPart, text: delta });
                  }
                } else {
                  if (partIdx >= 0) {
                    parts[partIdx] = { ...parts[partIdx], ...uiPart };
                  } else {
                    parts.push(uiPart);
                  }
                }
                next[idx] = { ...message, parts, status: SUBMITTED };
                return next;
              });
              break;
            }
            case 'message.updated': {
              const info = event.properties?.info;
              if (!info?.id) break;
              // No parts delivered here; we only update status/error if present
              setMessages((prev) => {
                const next = [...prev];
                const idx = next.findIndex((m) => m.id === info.id);
                if (idx === -1) {
                  next.push({
                    id: info.id,
                    role: info.role === 'assistant' ? 'assistant' : 'user',
                    parts: info.error ? [{ type: 'text', text: formatErrorText(info.error) }] : [],
                    status: info.error ? ERROR : READY
                  });
                  return next;
                }
                const message = next[idx];
                const statusForMessage = info.error ? ERROR : READY;
                const parts = [...(message.parts || [])];
                if (info.error) {
                  parts.push({ type: 'text', text: formatErrorText(info.error) });
                }
                next[idx] = { ...message, status: statusForMessage, parts };
                return next;
              });
              break;
            }
            default:
              break;
          }
        }
      } catch (err) {
        // Ignore subscription errors for now; streaming is best-effort
        console.warn('OpenCode event stream error', err);
      }
    };

    subscribe();

    return () => {
      canceled = true;
    };
  }, [active, client, directory, session?.id]);

  const sendMessage = useCallback(
    async (payload) => {
      if (!active || !client) return;
      if (!project?.worktree && !session?.directory) {
        const errObj = new Error('Select a project and session before chatting');
        setError(mapError(errObj));
        setMessages((prev) => [
          ...prev,
          {
            id: nanoid(),
            role: 'assistant',
            parts: [{ type: 'text', text: formatErrorText(errObj) }],
            status: ERROR
          }
        ]);
        setStatus(ERROR);
        return;
      }

      const text = (payload?.text || '').trim();
      const files = Array.isArray(payload?.files) ? payload.files : [];
      if (!text && files.length === 0) return;

      setError(null);
      setStatus(SUBMITTED);

      let targetSession;
      try {
        targetSession = await ensureSession();
      } catch (err) {
        setError(mapError(err));
        setStatus(ERROR);
        return;
      }
      if (!targetSession) {
        setError(mapError(new Error('Failed to create session')));
        setStatus(ERROR);
        return;
      }

      const userMessage = {
        id: nanoid(),
        role: 'user',
        parts: [
          ...(text ? [{ type: 'text', text }] : []),
          ...files.map((file) => ({
            type: 'file',
            url: file.url,
            mediaType: file.mediaType || DEFAULT_FILE_MIME,
            filename: file.filename
          }))
        ],
        status: READY
      };
      setMessages((prev) => [...prev, userMessage]);

      const partsInput = [
        ...(text ? [{ type: 'text', text }] : []),
        ...files.map(toFilePartInput)
      ];

      try {
        const res = await client.session.prompt({
          path: { id: targetSession.id },
          body: { parts: partsInput },
          query: { directory: targetSession.directory || project?.worktree }
        });

        if (res.error || !res.data) {
          const errObj = res.error || new Error('Failed to send message');
          setError(mapError(errObj));
          setMessages((prev) => [
            ...prev,
            {
              id: nanoid(),
              role: 'assistant',
              parts: [{ type: 'text', text: formatErrorText(errObj) }],
              status: ERROR
            }
          ]);
          setStatus(ERROR);
          return;
        }

        const assistantMessage = mapMessageToUi(res.data);
        setMessages((prev) => [...prev, assistantMessage]);
        setStatus(READY);
        setError(null);
      } catch (err) {
        setError(mapError(err));
        setMessages((prev) => [
          ...prev,
          {
            id: nanoid(),
            role: 'assistant',
            parts: [{ type: 'text', text: formatErrorText(err) }],
            status: ERROR
          }
        ]);
        setStatus(ERROR);
      }
    },
    [active, client, ensureSession, mapError, project, session]
  );

  const reload = useCallback(async () => {
    // Simple reload: refetch messages from the server to align local view.
    if (!session) return;
    await loadMessages();
  }, [loadMessages, session]);

  const clearError = useCallback(() => setError(null), []);

  const resetChatState = useCallback(() => {
    setError(null);
    setStatus(READY);
  }, []);

  const api = useMemo(
    () => ({
      messages,
      status,
      error,
      sendMessage,
      stop: () => {}, // No streaming hook yet
      clearError,
      reload,
      resetChatState,
      loadStatus
    }),
    [messages, status, error, sendMessage, clearError, reload, resetChatState, loadStatus]
  );

  return api;
}
