import { useEffect } from 'react';

export function useContextSelectionBridge({
  onExternalSelection,
  onAttachContext,
}) {
  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      return undefined;
    }

    const handleRuntimeMessage = (message) => {
      if (message?.type === 'openSidebar_contextSelection') {
        void onExternalSelection(message.payload?.text);
      }
      if (message?.type === 'openSidebar_contextAttachment') {
        void onAttachContext(message.payload?.text);
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
          if (!Array.isArray(selections) || selections.length === 0) {
            return;
          }

          (async () => {
            for (const selection of selections) {
              if (!selection?.text) {
                continue;
              }

              if (selection.type === 'attach') {
                await onAttachContext(selection.text);
              } else {
                await onExternalSelection(selection.text);
              }
            }
          })();
        }
      );
    }

    return () => {
      chrome.runtime.onMessage.removeListener(handleRuntimeMessage);
    };
  }, [onAttachContext, onExternalSelection]);
}
