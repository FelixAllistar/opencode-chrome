import { useCallback } from 'react';

/**
 * Thin wrapper over TUI endpoints so other parts of the app can push context.
 */
export function useOpenCodeTuiControls({ client, active }) {
  const safeCall = useCallback(
    async (fn) => {
      if (!client || !active) return;
      const res = await fn();
      if (res?.error) {
        console.error('OpenCode TUI error', res.error);
      }
      return res;
    },
    [active, client]
  );

  return {
    appendToPrompt: (text) => safeCall(() => client.tui.appendPrompt({ body: { text } })),
    openSessions: () => safeCall(() => client.tui.openSessions()),
    openModels: () => safeCall(() => client.tui.openModels()),
    submitPrompt: () => safeCall(() => client.tui.submitPrompt()),
    clearPrompt: () => safeCall(() => client.tui.clearPrompt()),
    showToast: (message, variant = 'default') =>
      safeCall(() => client.tui.showToast({ body: { message, variant } }))
  };
}
