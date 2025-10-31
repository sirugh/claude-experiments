// Mock Chrome APIs for testing
global.chrome = {
  runtime: {
    sendMessage: jest.fn((message, callback) => {
      if (callback) callback({ success: true });
    }),
    onMessage: {
      addListener: jest.fn()
    },
    onInstalled: {
      addListener: jest.fn()
    },
    lastError: null
  },
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        callback({});
      }),
      set: jest.fn((items, callback) => {
        if (callback) callback();
      }),
      remove: jest.fn((keys, callback) => {
        if (callback) callback();
      })
    }
  },
  contextMenus: {
    create: jest.fn(),
    onClicked: {
      addListener: jest.fn()
    }
  },
  tabs: {
    sendMessage: jest.fn((tabId, message, options, callback) => {
      if (typeof options === 'function') {
        callback = options;
      }
      if (callback) callback({ success: true });
    }),
    query: jest.fn((queryInfo, callback) => {
      callback([{ id: 1, url: 'https://example.com' }]);
    })
  }
};

// Mock CSS.escape
global.CSS = {
  escape: (str) => str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&')
};

// Mock DOM methods
if (!document.createElement) {
  document.createElement = (tagName) => {
    return {
      tagName: tagName.toUpperCase(),
      className: '',
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn()
      },
      style: {
        setProperty: jest.fn(),
        removeProperty: jest.fn()
      },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      appendChild: jest.fn(),
      remove: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(() => []),
      setAttribute: jest.fn(),
      getAttribute: jest.fn(),
      matches: jest.fn(() => false),
      scrollIntoView: jest.fn()
    };
  };
}

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
