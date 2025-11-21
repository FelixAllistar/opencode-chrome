import { useCallback, useEffect, useState } from 'react';
import { LOAD_STATUS } from './useOpenCodeProjects.js';

/**
 * Lists and creates sessions for a selected project (worktree).
 */
export function useOpenCodeSessions({ client, project, active }) {
  const [sessions, setSessions] = useState([]);
  const [status, setStatus] = useState(LOAD_STATUS.IDLE);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!client || !project || !active) return;
    setStatus(LOAD_STATUS.LOADING);
    setError(null);

    const res = await client.session.list({
      query: { directory: project.worktree }
    });

    if (res.error) {
      setError(res.error);
      setStatus(LOAD_STATUS.ERROR);
      return;
    }

    const data = Array.isArray(res.data) ? res.data : [];
    setSessions(
      data.map((session) => ({
        id: session.id,
        projectId: session.projectID,
        directory: session.directory,
        title: session.title,
        createdAt: session.time?.created,
        updatedAt: session.time?.updated,
        messageCount: session.summary?.diffs?.length ?? 0,
        lastMessage: ''
      }))
    );
    setStatus(LOAD_STATUS.READY);
  }, [active, client, project]);

  const createSession = useCallback(
    async (title) => {
      if (!client || !project || !active) return null;
      const res = await client.session.create({
        body: title ? { title } : {},
        query: { directory: project.worktree }
      });
      if (res.error) {
        setError(res.error);
        return null;
      }
      const session = res.data;
      if (!session) return null;
      const ref = {
        id: session.id,
        projectId: session.projectID,
        directory: session.directory,
        title: session.title,
        createdAt: session.time?.created,
        updatedAt: session.time?.updated,
        messageCount: session.summary?.diffs?.length ?? 0,
        lastMessage: ''
      };
      setSessions((prev) => [ref, ...prev]);
      return ref;
    },
    [active, client, project]
  );

  const deleteSessionById = useCallback(
    async (sessionId) => {
      if (!client || !project || !active || !sessionId) return;
      const res = await client.session.delete({
        path: { id: sessionId },
        query: { directory: project.worktree }
      });
      if (res?.error) {
        setError(res.error);
        return;
      }
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    },
    [active, client, project]
  );

  useEffect(() => {
    if (!active || !project) return;
    void refresh();
  }, [active, project, refresh]);

  return { sessions, status, error, refresh, createSession, deleteSessionById };
}
