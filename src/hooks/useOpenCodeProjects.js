import { useCallback, useEffect, useState } from 'react';

export const LOAD_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error'
};

/**
 * Lists OpenCode projects from the configured server.
 */
export function useOpenCodeProjects({ client, active }) {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState(LOAD_STATUS.IDLE);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!client || !active) return;
    setStatus(LOAD_STATUS.LOADING);
    setError(null);
    const res = await client.project.list();
    if (res.error) {
      setError(res.error);
      setStatus(LOAD_STATUS.ERROR);
      return;
    }
    const data = Array.isArray(res.data) ? res.data : [];
    setProjects(
      data.map((project) => ({
        id: project.id,
        worktree: project.worktree
      }))
    );
    setStatus(LOAD_STATUS.READY);
  }, [active, client]);

  useEffect(() => {
    if (!active) return;
    void refresh();
  }, [active, refresh]);

  return { projects, status, error, refresh };
}
