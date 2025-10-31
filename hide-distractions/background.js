// Create context menu on extension install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'hideElement',
    title: 'Hide This Element',
    contexts: ['all']
  });

  chrome.contextMenus.create({
    id: 'showAllElements',
    title: 'Show All Hidden Elements',
    contexts: ['all']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('[Hide Distractions] Context menu clicked:', info.menuItemId, 'on tab', tab.id);

  if (info.menuItemId === 'hideElement') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'hideElement',
      frameId: info.frameId
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[Hide Distractions] Error sending hideElement message:', chrome.runtime.lastError.message);
        console.error('[Hide Distractions] Tab URL:', tab.url);
      } else {
        console.log('[Hide Distractions] hideElement response:', response);
      }
    });
  } else if (info.menuItemId === 'showAllElements') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'showAllElements',
      frameId: info.frameId
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[Hide Distractions] Error sending showAllElements message:', chrome.runtime.lastError.message);
        console.error('[Hide Distractions] Tab URL:', tab.url);
      } else {
        console.log('[Hide Distractions] showAllElements response:', response);
      }
    });
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getHiddenElements') {
    chrome.storage.local.get([request.hostname], (result) => {
      sendResponse({ hiddenElements: result[request.hostname] || [] });
    });
    return true; // Will respond asynchronously
  } else if (request.action === 'saveHiddenElements') {
    chrome.storage.local.set({ [request.hostname]: request.hiddenElements }, () => {
      sendResponse({ success: true });
    });
    return true; // Will respond asynchronously
  }
});
