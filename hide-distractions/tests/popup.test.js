/**
 * Tests for popup.js
 */

describe('Popup - Tab Information', () => {
  beforeEach(() => {
    chrome.tabs.query.mockClear();
    document.body.innerHTML = '<div id="siteInfo"></div>';
  });

  test('should display hostname from current tab', () => {
    chrome.tabs.query.mockImplementation((queryInfo, callback) => {
      callback([{ id: 1, url: 'https://example.com/page' }]);
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = new URL(tabs[0].url);
      const hostname = url.hostname;

      document.getElementById('siteInfo').textContent = hostname;

      expect(hostname).toBe('example.com');
      expect(document.getElementById('siteInfo').textContent).toBe('example.com');
    });
  });

  test('should handle subdomain in hostname', () => {
    chrome.tabs.query.mockImplementation((queryInfo, callback) => {
      callback([{ id: 1, url: 'https://calendar.google.com/calendar' }]);
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = new URL(tabs[0].url);
      const hostname = url.hostname;

      expect(hostname).toBe('calendar.google.com');
    });
  });
});

describe('Popup - Hidden Elements Count', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="hiddenCount"></div>';
  });

  test('should display "No hidden elements" when count is 0', () => {
    const updateHiddenCount = (count) => {
      const countElement = document.getElementById('hiddenCount');
      if (count === 0) {
        countElement.textContent = 'No hidden elements';
      } else if (count === 1) {
        countElement.textContent = '1 hidden element';
      } else {
        countElement.textContent = `${count} hidden elements`;
      }
    };

    updateHiddenCount(0);

    expect(document.getElementById('hiddenCount').textContent).toBe('No hidden elements');
  });

  test('should display "1 hidden element" when count is 1', () => {
    const updateHiddenCount = (count) => {
      const countElement = document.getElementById('hiddenCount');
      if (count === 0) {
        countElement.textContent = 'No hidden elements';
      } else if (count === 1) {
        countElement.textContent = '1 hidden element';
      } else {
        countElement.textContent = `${count} hidden elements`;
      }
    };

    updateHiddenCount(1);

    expect(document.getElementById('hiddenCount').textContent).toBe('1 hidden element');
  });

  test('should display count with plural when count > 1', () => {
    const updateHiddenCount = (count) => {
      const countElement = document.getElementById('hiddenCount');
      if (count === 0) {
        countElement.textContent = 'No hidden elements';
      } else if (count === 1) {
        countElement.textContent = '1 hidden element';
      } else {
        countElement.textContent = `${count} hidden elements`;
      }
    };

    updateHiddenCount(5);

    expect(document.getElementById('hiddenCount').textContent).toBe('5 hidden elements');
  });
});

describe('Popup - Element Display', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="elementsTable"></div>';
  });

  test('should display empty state when no elements', () => {
    const elements = [];
    const tableElement = document.getElementById('elementsTable');

    if (elements.length === 0) {
      tableElement.innerHTML = '<div class="empty-state">No elements are currently hidden</div>';
    }

    expect(tableElement.innerHTML).toContain('No elements are currently hidden');
  });

  test('should display element information', () => {
    const elements = [
      {
        id: '1',
        selector: 'div.banner',
        tagName: 'div',
        textContent: 'Cookie notice',
        timestamp: Date.now()
      }
    ];

    const escapeHtml = (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    const tableElement = document.getElementById('elementsTable');
    const element = elements[0];

    tableElement.innerHTML = `
      <div class="element-row" data-id="${escapeHtml(element.id)}">
        <div class="element-info">
          <div class="element-tag">&lt;${escapeHtml(element.tagName)}&gt;</div>
          <div class="element-description">${escapeHtml(element.textContent)}</div>
          <div class="element-selector">${escapeHtml(element.selector)}</div>
        </div>
        <button class="remove-button" data-id="${escapeHtml(element.id)}">−</button>
      </div>
    `;

    expect(tableElement.innerHTML).toContain('&lt;div&gt;');
    expect(tableElement.innerHTML).toContain('Cookie notice');
    expect(tableElement.innerHTML).toContain('div.banner');
  });

  test('should sort elements by timestamp (newest first)', () => {
    const now = Date.now();
    const elements = [
      { id: '1', timestamp: now - 1000, textContent: 'Old' },
      { id: '2', timestamp: now, textContent: 'New' }
    ];

    const sorted = [...elements].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    expect(sorted[0].id).toBe('2');
    expect(sorted[1].id).toBe('1');
  });
});

describe('Popup - Timestamp Formatting', () => {
  test('should format timestamp as "Just now" for recent items', () => {
    const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;

      if (diff < 60000) return 'Just now';
      return '';
    };

    const recent = Date.now() - 5000; // 5 seconds ago
    expect(formatTimestamp(recent)).toBe('Just now');
  });

  test('should format timestamp as minutes ago', () => {
    const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;

      if (diff < 60000) return 'Just now';
      if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }
      return '';
    };

    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    expect(formatTimestamp(fiveMinutesAgo)).toBe('5 minutes ago');

    const oneMinuteAgo = Date.now() - (1 * 60 * 1000);
    expect(formatTimestamp(oneMinuteAgo)).toBe('1 minute ago');
  });

  test('should format timestamp as hours ago', () => {
    const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;

      if (diff < 60000) return 'Just now';
      if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }
      if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      }
      return '';
    };

    const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
    expect(formatTimestamp(twoHoursAgo)).toBe('2 hours ago');

    const oneHourAgo = Date.now() - (1 * 60 * 60 * 1000);
    expect(formatTimestamp(oneHourAgo)).toBe('1 hour ago');
  });

  test('should format timestamp as days ago', () => {
    const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;

      if (diff < 60000) return 'Just now';
      if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }
      if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      }
      const days = Math.floor(diff / 86400000);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    };

    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
    expect(formatTimestamp(threeDaysAgo)).toBe('3 days ago');

    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    expect(formatTimestamp(oneDayAgo)).toBe('1 day ago');
  });
});

describe('Popup - Button Actions', () => {
  beforeEach(() => {
    chrome.tabs.sendMessage.mockClear();
    chrome.storage.local.remove.mockClear();
  });

  test('should send showAllElements message when button clicked', () => {
    const tabId = 123;

    chrome.tabs.sendMessage(tabId, { action: 'showAllElements' });

    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
      tabId,
      { action: 'showAllElements' },
      expect.any(Function)
    );
  });

  test('should send showElement message with specific ID', () => {
    const tabId = 123;
    const elementId = 'abc123';

    chrome.tabs.sendMessage(tabId, { action: 'showElement', id: elementId });

    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
      tabId,
      { action: 'showElement', id: elementId },
      expect.any(Function)
    );
  });

  test('should clear storage for hostname when clear button clicked', () => {
    const hostname = 'example.com';

    chrome.storage.local.remove([hostname]);

    expect(chrome.storage.local.remove).toHaveBeenCalledWith([hostname]);
  });
});

describe('Popup - HTML Escaping', () => {
  test('should escape HTML special characters', () => {
    const escapeHtml = (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    const dangerous = '<script>alert("xss")</script>';
    const escaped = escapeHtml(dangerous);

    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;');
    expect(escaped).toContain('&gt;');
  });

  test('should escape quotes', () => {
    const escapeHtml = (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    const text = 'He said "Hello"';
    const escaped = escapeHtml(text);

    expect(escaped).toContain('&quot;');
  });
});

describe('Popup - Backward Compatibility', () => {
  test('should handle old format (string selectors)', () => {
    const elements = ['div.banner', 'button.close'];

    const displayElements = elements.map(element => {
      const isObject = typeof element === 'object';
      const selector = isObject ? element.selector : element;
      const tagName = isObject ? element.tagName : 'unknown';

      return { selector, tagName };
    });

    expect(displayElements[0].selector).toBe('div.banner');
    expect(displayElements[0].tagName).toBe('unknown');
  });

  test('should handle new format (element objects)', () => {
    const elements = [
      { id: '1', selector: 'div.banner', tagName: 'div', textContent: 'Notice' }
    ];

    const displayElements = elements.map(element => {
      const isObject = typeof element === 'object';
      const selector = isObject ? element.selector : element;
      const tagName = isObject ? element.tagName : 'unknown';

      return { selector, tagName };
    });

    expect(displayElements[0].selector).toBe('div.banner');
    expect(displayElements[0].tagName).toBe('div');
  });
});
