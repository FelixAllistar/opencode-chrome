import { useCallback, useEffect, useState } from 'react';

const REQUEST_TIMEOUT_MS = 4000;

export const LOAD_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error'
};

/**
 * Lists OpenCode projects from the configured server.
 */
export function useOpenCodeProjects({ client, active, baseUrl }) {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState(LOAD_STATUS.IDLE);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!client || !active) return;
    setStatus(LOAD_STATUS.LOADING);
    setError(null);

    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      setError(
        new Error(
          `OpenCode is not reachable${baseUrl ? ` at ${baseUrl}` : ''}. Start the server and retry.`
        )
      );
      setStatus(LOAD_STATUS.ERROR);
    }, REQUEST_TIMEOUT_MS);

    try {
      const res = await client.project.list();
      if (timedOut) return;
      clearTimeout(timeoutId);
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
    } catch (err) {
      if (timedOut) return;
      clearTimeout(timeoutId);
      setError(err);
      setStatus(LOAD_STATUS.ERROR);
    }
  }, [active, baseUrl, client]);

  useEffect(() => {
    if (!active) return;
    void refresh();
  }, [active, refresh]);

  return { projects, status, error, refresh };
}
