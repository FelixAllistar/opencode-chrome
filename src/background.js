const CONTEXT_MENU_ID = 'openSidebarSelection';

// Keep a simple queue in case the panel is opened after the context menu click.
const pendingSelections = [];

const createContextMenu = () => {
  if (!chrome.contextMenus) {
    return;
  }
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: 'Open in OpenSidebar',
      contexts: ['selection'],
    });
  });
};

const sendSelectionToPanel = (selection) => {
  chrome.runtime.sendMessage(
    {
      type: 'openSidebar_contextSelection',
      payload: selection,
    },
    () => {
      if (chrome.runtime.lastError) {
        return;
      }
    }
  );
};

const enqueueAndDispatchSelection = (selection) => {
  pendingSelections.push(selection);
  sendSelectionToPanel(selection);
};

createContextMenu();

chrome.runtime.onInstalled?.addListener(() => {
  createContextMenu();
});

chrome.runtime.onStartup?.addListener(() => {
  createContextMenu();
});

chrome.contextMenus?.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID) {
    return;
  }

  const text = (info.selectionText || '').trim();
  if (!text) {
    return;
  }

  const selection = {
    text,
    tabId: typeof info.tabId === 'number' ? info.tabId : null,
  };

  const tabId =
    typeof tab?.id === 'number'
      ? tab.id
      : typeof info.tabId === 'number'
      ? info.tabId
      : null;

  if (tabId !== null) {
    chrome.sidePanel.open({ tabId });
  }
  enqueueAndDispatchSelection(selection);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'openSidebar_getPendingSelections') {
    const selections = pendingSelections.splice(0, pendingSelections.length);
    sendResponse({ selections });
  }
});
