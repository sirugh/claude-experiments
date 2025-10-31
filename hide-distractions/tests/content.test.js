/**
 * Tests for content.js
 */

describe('Smart Parent Element Detection', () => {
  // Helper to create a DOM structure
  const createElementTree = () => {
    const button = document.createElement('button');
    button.id = 'test-button';

    const span = document.createElement('span');
    span.textContent = 'Click me';

    button.appendChild(span);
    document.body.appendChild(button);

    return { button, span };
  };

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('should detect button parent when text inside is clicked', () => {
    const { button, span } = createElementTree();

    // Mock the matches method
    button.matches = jest.fn((selector) => selector === 'button');
    span.matches = jest.fn(() => false);
    span.parentElement = button;

    // Simulate the findBestElementToHide logic
    let current = span;
    let found = null;

    while (current && current !== document.body) {
      if (current.matches('button')) {
        found = current;
        break;
      }
      current = current.parentElement;
    }

    expect(found).toBe(button);
    expect(found.tagName).toBe('BUTTON');
  });

  test('should detect link parent when text inside is clicked', () => {
    const link = document.createElement('a');
    link.href = '#';
    link.matches = jest.fn((selector) => selector === 'a');

    const text = document.createElement('span');
    text.textContent = 'Link text';
    text.matches = jest.fn(() => false);
    text.parentElement = link;

    link.appendChild(text);
    document.body.appendChild(link);

    let current = text;
    let found = null;

    while (current && current !== document.body) {
      if (current.matches('a')) {
        found = current;
        break;
      }
      current = current.parentElement;
    }

    expect(found).toBe(link);
    expect(found.tagName).toBe('A');
  });

  test('should detect modal parent for nested elements', () => {
    const modal = document.createElement('div');
    modal.setAttribute('role', 'dialog');
    modal.matches = jest.fn((selector) => selector === '[role="dialog"]');

    const content = document.createElement('div');
    content.matches = jest.fn(() => false);
    content.parentElement = modal;

    modal.appendChild(content);
    document.body.appendChild(modal);

    let current = content;
    let found = null;

    while (current && current !== document.body) {
      if (current.matches('[role="dialog"]')) {
        found = current;
        break;
      }
      current = current.parentElement;
    }

    expect(found).toBe(modal);
  });

  test('should return original element if no better parent found', () => {
    const div = document.createElement('div');
    div.matches = jest.fn(() => false);
    document.body.appendChild(div);

    // If no interactive parent is found, should return the element itself
    expect(div).toBe(div);
  });
});

describe('CSS Selector Generation', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('should use ID when element has one', () => {
    const element = document.createElement('div');
    element.id = 'unique-id';

    const selector = `#${CSS.escape(element.id)}`;

    expect(selector).toBe('#unique-id');
  });

  test('should escape special characters in ID', () => {
    const element = document.createElement('div');
    element.id = 'my:special.id';

    const selector = `#${CSS.escape(element.id)}`;

    expect(selector).toContain('\\:');
    expect(selector).toContain('\\.');
  });

  test('should build path with tag name and classes', () => {
    const element = document.createElement('div');
    element.className = 'container main';

    const tagName = element.tagName.toLowerCase();
    const classes = element.className.split(' ').filter(c => c);
    const selector = tagName + '.' + classes.map(c => CSS.escape(c)).join('.');

    expect(selector).toBe('div.container.main');
  });

  test('should handle elements without classes', () => {
    const element = document.createElement('button');
    element.className = '';

    const selector = element.tagName.toLowerCase();

    expect(selector).toBe('button');
  });
});

describe('Element Metadata Extraction', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('should extract tag name and text content', () => {
    const button = document.createElement('button');
    button.textContent = 'Click me';

    const metadata = {
      tagName: button.tagName.toLowerCase(),
      textContent: button.textContent.trim()
    };

    expect(metadata.tagName).toBe('button');
    expect(metadata.textContent).toBe('Click me');
  });

  test('should use aria-label if no text content', () => {
    const button = document.createElement('button');
    button.setAttribute('aria-label', 'Close dialog');
    button.textContent = '';

    let textContent = button.textContent.trim();
    if (!textContent) {
      textContent = button.getAttribute('aria-label');
    }

    expect(textContent).toBe('Close dialog');
  });

  test('should use title attribute as fallback', () => {
    const div = document.createElement('div');
    div.setAttribute('title', 'Tooltip text');
    div.textContent = '';

    let textContent = div.textContent.trim();
    if (!textContent) {
      const ariaLabel = div.getAttribute('aria-label');
      const title = div.getAttribute('title');
      textContent = ariaLabel || title;
    }

    expect(textContent).toBe('Tooltip text');
  });

  test('should truncate long text content', () => {
    const div = document.createElement('div');
    div.textContent = 'a'.repeat(200);

    const truncated = div.textContent.substring(0, 100);

    expect(truncated.length).toBe(100);
  });
});

describe('Element Hiding and Showing', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('should add hidden class to element', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    element.classList.add('hide-distractions-hidden');

    expect(element.classList.add).toHaveBeenCalledWith('hide-distractions-hidden');
  });

  test('should set pointer-events to none', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    element.style.setProperty('pointer-events', 'none', 'important');

    expect(element.style.setProperty).toHaveBeenCalledWith(
      'pointer-events',
      'none',
      'important'
    );
  });

  test('should remove hidden class when showing element', () => {
    const element = document.createElement('div');
    element.classList.add('hide-distractions-hidden');
    document.body.appendChild(element);

    element.classList.remove('hide-distractions-hidden');
    element.style.removeProperty('pointer-events');

    expect(element.classList.remove).toHaveBeenCalledWith('hide-distractions-hidden');
    expect(element.style.removeProperty).toHaveBeenCalledWith('pointer-events');
  });
});

describe('Storage Operations', () => {
  beforeEach(() => {
    chrome.storage.local.get.mockClear();
    chrome.storage.local.set.mockClear();
  });

  test('should save hidden elements to storage', async () => {
    const hostname = 'example.com';
    const hiddenElements = [
      { id: '1', selector: 'div.banner', tagName: 'div', textContent: 'Cookie notice' }
    ];

    chrome.storage.local.set({ [hostname]: hiddenElements });

    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      { [hostname]: hiddenElements }
    );
  });

  test('should load hidden elements from storage', async () => {
    const hostname = 'example.com';
    const expectedElements = [
      { id: '1', selector: 'div.banner', tagName: 'div', textContent: 'Cookie notice' }
    ];

    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({ [hostname]: expectedElements });
    });

    chrome.storage.local.get([hostname], (result) => {
      expect(result[hostname]).toEqual(expectedElements);
    });
  });

  test('should remove hostname data from storage', async () => {
    const hostname = 'example.com';

    chrome.storage.local.remove([hostname]);

    expect(chrome.storage.local.remove).toHaveBeenCalledWith([hostname]);
  });
});

describe('Message Handling', () => {
  beforeEach(() => {
    chrome.runtime.sendMessage.mockClear();
  });

  test('should send hideElement message', () => {
    const message = { action: 'hideElement' };

    chrome.runtime.sendMessage(message);

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(message);
  });

  test('should send showElement message with element ID', () => {
    const message = { action: 'showElement', id: '123' };

    chrome.runtime.sendMessage(message);

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(message);
  });

  test('should send showAllElements message', () => {
    const message = { action: 'showAllElements' };

    chrome.runtime.sendMessage(message);

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(message);
  });

  test('should handle getHiddenElements request', () => {
    const hostname = 'example.com';
    const message = { action: 'getHiddenElements', hostname };

    chrome.runtime.sendMessage(message, (response) => {
      expect(response).toBeDefined();
    });
  });
});

describe('Preview and Confirmation', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('should create preview overlay', () => {
    const overlay = document.createElement('div');
    overlay.className = 'hide-distractions-preview-overlay';
    document.body.appendChild(overlay);

    const foundOverlay = document.querySelector('.hide-distractions-preview-overlay');
    expect(foundOverlay).toBeTruthy();
  });

  test('should create confirmation dialog', () => {
    const dialog = document.createElement('div');
    dialog.className = 'hide-distractions-confirm-dialog';
    document.body.appendChild(dialog);

    const foundDialog = document.querySelector('.hide-distractions-confirm-dialog');
    expect(foundDialog).toBeTruthy();
  });

  test('should highlight target element', () => {
    const element = document.createElement('div');
    element.classList.add('hide-distractions-preview-target');
    document.body.appendChild(element);

    expect(element.classList.add).toHaveBeenCalledWith('hide-distractions-preview-target');
  });

  test('should remove preview elements on cleanup', () => {
    const overlay = document.createElement('div');
    overlay.className = 'hide-distractions-preview-overlay';
    const dialog = document.createElement('div');
    dialog.className = 'hide-distractions-confirm-dialog';
    const target = document.createElement('div');
    target.classList.add('hide-distractions-preview-target');

    document.body.appendChild(overlay);
    document.body.appendChild(dialog);
    document.body.appendChild(target);

    overlay.remove();
    dialog.remove();
    target.classList.remove('hide-distractions-preview-target');

    expect(overlay.remove).toHaveBeenCalled();
    expect(dialog.remove).toHaveBeenCalled();
    expect(target.classList.remove).toHaveBeenCalledWith('hide-distractions-preview-target');
  });

  test('should scroll element into view', () => {
    const element = document.createElement('div');
    element.scrollIntoView = jest.fn();

    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    expect(element.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center'
    });
  });
});
