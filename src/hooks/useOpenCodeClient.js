import { useMemo } from 'react';
import { createOpencodeClient } from '@opencode-ai/sdk/client';

/**
 * Shared OpenCode client constructor.
 * Keeps the client stable for a given baseUrl and only activates when requested.
 */
export function useOpenCodeClient({ baseUrl, active }) {
  const client = useMemo(() => {
    if (!active || !baseUrl) return null;
    return createOpencodeClient({ baseUrl });
  }, [active, baseUrl]);

  return { client };
}
