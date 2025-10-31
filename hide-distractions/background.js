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
  if (info.menuItemId === 'hideElement') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'hideElement',
      frameId: info.frameId
    });
  } else if (info.menuItemId === 'showAllElements') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'showAllElements',
      frameId: info.frameId
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
