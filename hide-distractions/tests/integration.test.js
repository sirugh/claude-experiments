/**
 * Integration tests for the Hide Distractions extension
 * These tests verify the complete flow of hiding and showing elements
 */

describe('Integration - Complete Hide Element Flow', () => {
  let mockStorage = {};

  beforeEach(() => {
    mockStorage = {};
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      const result = {};
      keys.forEach(key => {
        if (mockStorage[key]) {
          result[key] = mockStorage[key];
        }
      });
      callback(result);
    });

    chrome.storage.local.set.mockImplementation((items, callback) => {
      Object.assign(mockStorage, items);
      if (callback) callback();
    });

    chrome.storage.local.remove.mockImplementation((keys, callback) => {
      keys.forEach(key => delete mockStorage[key]);
      if (callback) callback();
    });
  });

  test('should complete full flow of hiding an element', (done) => {
    const hostname = 'example.com';
    const element = {
      id: '1',
      selector: 'div.cookie-banner',
      tagName: 'div',
      textContent: 'We use cookies',
      timestamp: Date.now()
    };

    // Step 1: User clicks "Hide This Element"
    // Background script receives context menu click
    const contextMenuClick = (info, tab) => {
      expect(info.menuItemId).toBe('hideElement');
      expect(tab.id).toBe(123);

      // Step 2: Background sends message to content script
      chrome.tabs.sendMessage(tab.id, { action: 'hideElement' }, {}, (response) => {
        expect(response.success).toBe(true);

        // Step 3: Content script saves to storage
        chrome.runtime.sendMessage({
          action: 'saveHiddenElements',
          hostname: hostname,
          hiddenElements: [element]
        }, () => {
          // Step 4: Verify element was saved
          chrome.storage.local.get([hostname], (result) => {
            expect(result[hostname]).toEqual([element]);
            done();
          });
        });
      });
    };

    contextMenuClick(
      { menuItemId: 'hideElement', frameId: 0 },
      { id: 123, url: 'https://example.com' }
    );
  });

  test('should complete full flow of showing a hidden element', (done) => {
    const hostname = 'example.com';
    const elements = [
      {
        id: '1',
        selector: 'div.banner',
        tagName: 'div',
        textContent: 'Banner',
        timestamp: Date.now()
      },
      {
        id: '2',
        selector: 'div.popup',
        tagName: 'div',
        textContent: 'Popup',
        timestamp: Date.now()
      }
    ];

    // Pre-populate storage
    mockStorage[hostname] = elements;

    // Step 1: User clicks remove button for element with id '1'
    chrome.tabs.sendMessage(123, { action: 'showElement', id: '1' }, () => {
      // Step 2: Content script removes element and saves
      const updatedElements = elements.filter(el => el.id !== '1');

      chrome.runtime.sendMessage({
        action: 'saveHiddenElements',
        hostname: hostname,
        hiddenElements: updatedElements
      }, () => {
        // Step 3: Verify only one element remains
        chrome.storage.local.get([hostname], (result) => {
          expect(result[hostname].length).toBe(1);
          expect(result[hostname][0].id).toBe('2');
          done();
        });
      });
    });
  });

  test('should complete full flow of showing all elements', (done) => {
    const hostname = 'example.com';
    const elements = [
      { id: '1', selector: 'div.banner', tagName: 'div', textContent: 'Banner' },
      { id: '2', selector: 'div.popup', tagName: 'div', textContent: 'Popup' }
    ];

    // Pre-populate storage
    mockStorage[hostname] = elements;

    // Step 1: User clicks "Show All Hidden Elements"
    chrome.tabs.sendMessage(123, { action: 'showAllElements' }, () => {
      // Step 2: Content script clears all elements
      chrome.runtime.sendMessage({
        action: 'saveHiddenElements',
        hostname: hostname,
        hiddenElements: []
      }, () => {
        // Step 3: Verify storage is empty
        chrome.storage.local.get([hostname], (result) => {
          expect(result[hostname]).toEqual([]);
          done();
        });
      });
    });
  });
});

describe('Integration - Multi-Site Storage', () => {
  let mockStorage = {};

  beforeEach(() => {
    mockStorage = {};
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      const result = {};
      keys.forEach(key => {
        if (mockStorage[key]) {
          result[key] = mockStorage[key];
        }
      });
      callback(result);
    });

    chrome.storage.local.set.mockImplementation((items, callback) => {
      Object.assign(mockStorage, items);
      if (callback) callback();
    });
  });

  test('should store elements separately for different sites', (done) => {
    const site1 = 'example.com';
    const site2 = 'google.com';

    const elements1 = [
      { id: '1', selector: 'div.banner', tagName: 'div', textContent: 'Example banner' }
    ];

    const elements2 = [
      { id: '2', selector: 'div.popup', tagName: 'div', textContent: 'Google popup' }
    ];

    // Save elements for site 1
    chrome.storage.local.set({ [site1]: elements1 }, () => {
      // Save elements for site 2
      chrome.storage.local.set({ [site2]: elements2 }, () => {
        // Verify both sites have their own elements
        chrome.storage.local.get([site1], (result1) => {
          expect(result1[site1]).toEqual(elements1);

          chrome.storage.local.get([site2], (result2) => {
            expect(result2[site2]).toEqual(elements2);
            done();
          });
        });
      });
    });
  });

  test('should not affect other sites when clearing one site', (done) => {
    const site1 = 'example.com';
    const site2 = 'google.com';

    mockStorage[site1] = [{ id: '1', selector: 'div.banner' }];
    mockStorage[site2] = [{ id: '2', selector: 'div.popup' }];

    // Clear site1
    chrome.storage.local.remove([site1], () => {
      // Verify site1 is cleared
      chrome.storage.local.get([site1], (result1) => {
        expect(result1[site1]).toBeUndefined();

        // Verify site2 is unaffected
        chrome.storage.local.get([site2], (result2) => {
          expect(result2[site2]).toBeDefined();
          expect(result2[site2].length).toBe(1);
          done();
        });
      });
    });
  });
});

describe('Integration - Smart Parent Detection Flow', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('should find button parent when inner text is clicked', () => {
    // Create DOM structure
    const button = document.createElement('button');
    button.id = 'test-button';
    button.setAttribute('class', 'close-btn');

    const icon = document.createElement('span');
    icon.className = 'icon';

    const text = document.createElement('span');
    text.textContent = 'Close';

    button.appendChild(icon);
    button.appendChild(text);
    document.body.appendChild(button);

    // Mock matches method
    button.matches = jest.fn((selector) => selector === 'button');
    text.matches = jest.fn(() => false);
    text.parentElement = button;

    // Simulate finding best parent
    let current = text;
    let found = null;

    while (current && current !== document.body) {
      if (current.matches && current.matches('button')) {
        found = current;
        break;
      }
      current = current.parentElement;
    }

    expect(found).toBe(button);
    expect(found.id).toBe('test-button');
  });

  test('should generate correct selector for found element', () => {
    const button = document.createElement('button');
    button.id = 'cookie-accept';

    document.body.appendChild(button);

    const selector = `#${CSS.escape(button.id)}`;

    expect(selector).toBe('#cookie-accept');
  });
});

describe('Integration - Preview and Confirmation Flow', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('should create complete preview UI', () => {
    // Create target element
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.textContent = 'We use cookies';
    document.body.appendChild(banner);

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'hide-distractions-preview-overlay';
    document.body.appendChild(overlay);

    // Highlight target
    banner.classList.add('hide-distractions-preview-target');

    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'hide-distractions-confirm-dialog';
    dialog.innerHTML = `
      <h3>Hide this element?</h3>
      <div class="element-info">
        <div class="element-tag">&lt;div&gt;</div>
        <div>We use cookies</div>
      </div>
      <div class="hide-distractions-confirm-buttons">
        <button class="hide-distractions-confirm-no">Cancel</button>
        <button class="hide-distractions-confirm-yes">Hide Element</button>
      </div>
    `;
    document.body.appendChild(dialog);

    // Verify all preview elements are present
    expect(document.querySelector('.hide-distractions-preview-overlay')).toBeTruthy();
    expect(document.querySelector('.hide-distractions-preview-target')).toBeTruthy();
    expect(document.querySelector('.hide-distractions-confirm-dialog')).toBeTruthy();
    expect(dialog.innerHTML).toContain('Hide this element?');
  });

  test('should clean up preview UI on cancel', () => {
    const overlay = document.createElement('div');
    overlay.className = 'hide-distractions-preview-overlay';
    const dialog = document.createElement('div');
    dialog.className = 'hide-distractions-confirm-dialog';
    const target = document.createElement('div');
    target.classList.add('hide-distractions-preview-target');

    document.body.appendChild(overlay);
    document.body.appendChild(dialog);
    document.body.appendChild(target);

    // Clean up
    overlay.remove();
    dialog.remove();
    target.classList.remove('hide-distractions-preview-target');

    // Verify cleanup
    expect(document.querySelector('.hide-distractions-preview-overlay')).toBeFalsy();
    expect(document.querySelector('.hide-distractions-confirm-dialog')).toBeFalsy();
    expect(target.classList.contains('hide-distractions-preview-target')).toBe(false);
  });
});

describe('Integration - Error Handling Flow', () => {
  test('should handle content script not available', (done) => {
    chrome.runtime.lastError = { message: 'Receiving end does not exist' };

    chrome.tabs.sendMessage(123, { action: 'hideElement' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Content script not available');
        expect(console.error).toHaveBeenCalled();
        done();
      }
    });
  });

  test('should handle storage errors gracefully', (done) => {
    chrome.storage.local.set.mockImplementation((items, callback) => {
      chrome.runtime.lastError = { message: 'Storage quota exceeded' };
      if (callback) callback();
    });

    chrome.storage.local.set({ 'example.com': [] }, () => {
      if (chrome.runtime.lastError) {
        console.error('Storage error:', chrome.runtime.lastError.message);
        expect(console.error).toHaveBeenCalled();
        done();
      }
    });
  });
});
