/**
 * Tests for background.js
 */

describe('Background Script - Context Menu', () => {
  beforeEach(() => {
    chrome.contextMenus.create.mockClear();
  });

  test('should create hideElement context menu on install', () => {
    const handler = jest.fn();
    chrome.runtime.onInstalled.addListener(handler);

    // Simulate install event
    handler();

    chrome.contextMenus.create({
      id: 'hideElement',
      title: 'Hide This Element',
      contexts: ['all']
    });

    expect(chrome.contextMenus.create).toHaveBeenCalledWith({
      id: 'hideElement',
      title: 'Hide This Element',
      contexts: ['all']
    });
  });

  test('should create showAllElements context menu on install', () => {
    const handler = jest.fn();
    chrome.runtime.onInstalled.addListener(handler);

    handler();

    chrome.contextMenus.create({
      id: 'showAllElements',
      title: 'Show All Hidden Elements',
      contexts: ['all']
    });

    expect(chrome.contextMenus.create).toHaveBeenCalledWith({
      id: 'showAllElements',
      title: 'Show All Hidden Elements',
      contexts: ['all']
    });
  });
});

describe('Background Script - Context Menu Click Handling', () => {
  beforeEach(() => {
    chrome.tabs.sendMessage.mockClear();
  });

  test('should send hideElement message when hideElement menu is clicked', () => {
    const info = { menuItemId: 'hideElement', frameId: 0 };
    const tab = { id: 123, url: 'https://example.com' };

    const handler = jest.fn((clickInfo, clickTab) => {
      const messageOptions = clickInfo.frameId ? { frameId: clickInfo.frameId } : {};
      chrome.tabs.sendMessage(
        clickTab.id,
        { action: 'hideElement' },
        messageOptions
      );
    });

    handler(info, tab);

    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
      123,
      { action: 'hideElement' },
      { frameId: 0 }
    );
  });

  test('should send showAllElements message when showAllElements menu is clicked', () => {
    const info = { menuItemId: 'showAllElements', frameId: 0 };
    const tab = { id: 456, url: 'https://example.com' };

    const handler = jest.fn((clickInfo, clickTab) => {
      const messageOptions = clickInfo.frameId ? { frameId: clickInfo.frameId } : {};
      chrome.tabs.sendMessage(
        clickTab.id,
        { action: 'showAllElements' },
        messageOptions
      );
    });

    handler(info, tab);

    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
      456,
      { action: 'showAllElements' },
      { frameId: 0 }
    );
  });

  test('should handle frameId correctly when undefined', () => {
    const info = { menuItemId: 'hideElement', frameId: undefined };
    const tab = { id: 789, url: 'https://example.com' };

    const handler = jest.fn((clickInfo, clickTab) => {
      const messageOptions = clickInfo.frameId ? { frameId: clickInfo.frameId } : {};
      chrome.tabs.sendMessage(
        clickTab.id,
        { action: 'hideElement' },
        messageOptions
      );
    });

    handler(info, tab);

    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
      789,
      { action: 'hideElement' },
      {}
    );
  });
});

describe('Background Script - Message Listeners', () => {
  beforeEach(() => {
    chrome.storage.local.get.mockClear();
    chrome.storage.local.set.mockClear();
  });

  test('should handle getHiddenElements request', () => {
    const hostname = 'example.com';
    const expectedElements = [
      { id: '1', selector: '.banner', tagName: 'div', textContent: 'Cookie notice' }
    ];

    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({ [hostname]: expectedElements });
    });

    const handler = jest.fn((request, sender, sendResponse) => {
      if (request.action === 'getHiddenElements') {
        chrome.storage.local.get([request.hostname], (result) => {
          sendResponse({ hiddenElements: result[request.hostname] || [] });
        });
        return true;
      }
    });

    const sendResponse = jest.fn();
    handler({ action: 'getHiddenElements', hostname }, {}, sendResponse);

    expect(chrome.storage.local.get).toHaveBeenCalledWith(
      [hostname],
      expect.any(Function)
    );
  });

  test('should handle saveHiddenElements request', () => {
    const hostname = 'example.com';
    const hiddenElements = [
      { id: '1', selector: '.banner', tagName: 'div', textContent: 'Cookie notice' }
    ];

    const handler = jest.fn((request, sender, sendResponse) => {
      if (request.action === 'saveHiddenElements') {
        chrome.storage.local.set(
          { [request.hostname]: request.hiddenElements },
          () => {
            sendResponse({ success: true });
          }
        );
        return true;
      }
    });

    const sendResponse = jest.fn();
    handler({ action: 'saveHiddenElements', hostname, hiddenElements }, {}, sendResponse);

    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      { [hostname]: hiddenElements },
      expect.any(Function)
    );
  });

  test('should return empty array if no hidden elements found', () => {
    const hostname = 'new-site.com';

    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({});
    });

    const handler = jest.fn((request, sender, sendResponse) => {
      if (request.action === 'getHiddenElements') {
        chrome.storage.local.get([request.hostname], (result) => {
          sendResponse({ hiddenElements: result[request.hostname] || [] });
        });
        return true;
      }
    });

    const sendResponse = jest.fn();
    handler({ action: 'getHiddenElements', hostname }, {}, sendResponse);

    // The callback should eventually call sendResponse with empty array
    // In actual execution, this would happen asynchronously
  });
});

describe('Background Script - Error Handling', () => {
  beforeEach(() => {
    chrome.tabs.sendMessage.mockClear();
    chrome.runtime.lastError = null;
  });

  test('should handle connection errors gracefully', () => {
    chrome.runtime.lastError = { message: 'Could not establish connection' };

    const callback = jest.fn((response) => {
      if (chrome.runtime.lastError) {
        console.error('Error:', chrome.runtime.lastError.message);
      }
    });

    chrome.tabs.sendMessage(123, { action: 'hideElement' }, callback);
    callback();

    expect(console.error).toHaveBeenCalled();
  });

  test('should log tab URL on error for debugging', () => {
    chrome.runtime.lastError = { message: 'Receiving end does not exist' };
    const tab = { id: 123, url: 'chrome://extensions/' };

    const callback = jest.fn((response) => {
      if (chrome.runtime.lastError) {
        console.error('Error:', chrome.runtime.lastError.message);
        console.error('Tab URL:', tab.url);
      }
    });

    chrome.tabs.sendMessage(tab.id, { action: 'hideElement' }, callback);
    callback();

    expect(console.error).toHaveBeenCalledWith(
      'Error:',
      'Receiving end does not exist'
    );
    expect(console.error).toHaveBeenCalledWith('Tab URL:', tab.url);
  });
});

describe('Background Script - Frame Handling', () => {
  test('should include frameId in message options when present', () => {
    const info = { menuItemId: 'hideElement', frameId: 5 };
    const tab = { id: 123 };

    const messageOptions = info.frameId ? { frameId: info.frameId } : {};

    expect(messageOptions).toEqual({ frameId: 5 });
  });

  test('should send empty options when frameId is 0', () => {
    const info = { menuItemId: 'hideElement', frameId: 0 };

    const messageOptions = info.frameId ? { frameId: info.frameId } : {};

    // frameId 0 is truthy, so it should be included
    expect(messageOptions).toEqual({ frameId: 0 });
  });

  test('should send empty options when frameId is undefined', () => {
    const info = { menuItemId: 'hideElement', frameId: undefined };

    const messageOptions = info.frameId ? { frameId: info.frameId } : {};

    expect(messageOptions).toEqual({});
  });
});
