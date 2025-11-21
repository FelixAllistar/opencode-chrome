import { useCallback, useEffect, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import { LOAD_STATUS } from './useOpenCodeProjects.js';

const READY = 'ready';
const ERROR = 'error';
const SUBMITTED = 'submitted';

const DEFAULT_FILE_MIME = 'application/octet-stream';

const mapPartToUi = (part) => {
  switch (part.type) {
    case 'text':
      return { type: 'text', text: part.text };
    case 'reasoning':
      return { type: 'reasoning', text: part.text };
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
  return {
    id: entry?.info?.id || nanoid(),
    role,
    parts: Array.isArray(entry?.parts) ? entry.parts.map(mapPartToUi) : [],
    status: READY
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
    const message = err?.message || err?.data?.message || 'Something went wrong';
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
    const res = await client.session.messages({
      path: { id: session.id },
      query: { directory }
    });
    if (res.error) {
      setError(mapError(res.error));
      setLoadStatus(LOAD_STATUS.ERROR);
      return;
    }
    const data = Array.isArray(res.data) ? res.data : [];
    setMessages(data.map(mapMessageToUi));
    setLoadStatus(LOAD_STATUS.READY);
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

  const sendMessage = useCallback(
    async (payload) => {
      if (!active || !client) return;
      if (!project?.worktree && !session?.directory) {
        setError(mapError(new Error('Select a project and session before chatting')));
        setStatus(ERROR);
        return;
      }

      const text = (payload?.text || '').trim();
      const files = Array.isArray(payload?.files) ? payload.files : [];
      if (!text && files.length === 0) return;

      setError(null);
      setStatus(SUBMITTED);

      const targetSession = await ensureSession();
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

      const res = await client.session.prompt({
        path: { id: targetSession.id },
        body: { parts: partsInput },
        query: { directory: targetSession.directory || project?.worktree }
      });

      if (res.error || !res.data) {
        setError(mapError(res.error || new Error('Failed to send message')));
        setStatus(ERROR);
        return;
      }

      const assistantMessage = mapMessageToUi(res.data);
      setMessages((prev) => [...prev, assistantMessage]);
      setStatus(READY);
      setError(null);
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
