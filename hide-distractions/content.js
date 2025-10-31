// Store the element we right-clicked on
let clickedElement = null;
let hiddenElements = []; // Array of {id, selector, tagName, textContent, timestamp}
const hostname = window.location.hostname;

console.log('[Hide Distractions] Content script loaded on:', hostname);

// Find the best element to hide (not just the clicked target)
function findBestElementToHide(element) {
  // Interactive elements that should be hidden as a whole
  const interactiveSelectors = [
    'button',
    'a',
    '[role="button"]',
    '[role="link"]',
    '[onclick]',
    '[role="dialog"]',
    '[role="alertdialog"]',
    '[role="banner"]',
    '.modal',
    '.popup',
    '.dialog',
    '.banner',
    '.toast',
    '.notification'
  ];

  // Check if we're inside an interactive element
  let current = element;
  let depth = 0;
  const maxDepth = 5; // Don't traverse too far up

  while (current && current !== document.body && depth < maxDepth) {
    // Check if this element matches any interactive selectors
    for (const selector of interactiveSelectors) {
      try {
        if (current.matches(selector)) {
          console.log('[Hide Distractions] Found better parent:', current.tagName, selector);
          return current;
        }
      } catch (e) {
        // Invalid selector, skip
      }
    }

    // If element has an ID or meaningful class, it might be a good candidate
    if (current.id || (current.className && typeof current.className === 'string' && current.className.length > 0)) {
      // But only if it's not too deep
      if (depth > 0) {
        console.log('[Hide Distractions] Found meaningful parent:', current.tagName);
        return current;
      }
    }

    current = current.parentElement;
    depth++;
  }

  // If nothing better found, return original element
  return element;
}

// Generate a unique CSS selector for an element
function getUniqueSelector(element) {
  if (element.id) {
    return `#${CSS.escape(element.id)}`;
  }

  // Build path from element to root
  const path = [];
  while (element && element.nodeType === Node.ELEMENT_NODE) {
    let selector = element.nodeName.toLowerCase();

    if (element.className && typeof element.className === 'string') {
      const classes = element.className.trim().split(/\s+/).filter(c => c);
      if (classes.length > 0) {
        selector += '.' + classes.map(c => CSS.escape(c)).join('.');
      }
    }

    // Add nth-child if we need more specificity
    if (element.parentNode) {
      const siblings = Array.from(element.parentNode.children);
      const index = siblings.indexOf(element) + 1;
      if (siblings.length > 1) {
        selector += `:nth-child(${index})`;
      }
    }

    path.unshift(selector);
    element = element.parentNode;

    // Stop at body or if we have enough specificity
    if (!element || element.nodeName === 'BODY' || path.length > 5) {
      break;
    }
  }

  return path.join(' > ');
}

// Show preview and confirmation dialog
function showPreviewAndConfirm(element) {
  return new Promise((resolve) => {
    // Remove any existing preview
    removePreview();

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'hide-distractions-preview-overlay';
    document.body.appendChild(overlay);

    // Highlight the target element
    element.classList.add('hide-distractions-preview-target');

    // Scroll element into view if needed
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Get element info for display
    const metadata = getElementMetadata(element);
    const selector = getUniqueSelector(element);

    // Create confirmation dialog
    const dialog = document.createElement('div');
    dialog.className = 'hide-distractions-confirm-dialog';
    dialog.innerHTML = `
      <h3>Hide this element?</h3>
      <p>The highlighted element will be made invisible on this page.</p>
      <div class="element-info">
        <div class="element-tag">&lt;${metadata.tagName}&gt;</div>
        <div>${metadata.textContent.substring(0, 100)}${metadata.textContent.length > 100 ? '...' : ''}</div>
      </div>
      <div class="hide-distractions-confirm-buttons">
        <button class="hide-distractions-confirm-button hide-distractions-confirm-no">Cancel</button>
        <button class="hide-distractions-confirm-button hide-distractions-confirm-yes">Hide Element</button>
      </div>
    `;
    document.body.appendChild(dialog);

    // Handle button clicks
    const yesButton = dialog.querySelector('.hide-distractions-confirm-yes');
    const noButton = dialog.querySelector('.hide-distractions-confirm-no');

    yesButton.addEventListener('click', () => {
      removePreview();
      resolve(true);
    });

    noButton.addEventListener('click', () => {
      removePreview();
      resolve(false);
    });

    // Handle escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        removePreview();
        resolve(false);
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);

    // Store references for cleanup
    overlay._escapeHandler = escapeHandler;
  });
}

// Remove preview overlay and dialog
function removePreview() {
  const overlay = document.querySelector('.hide-distractions-preview-overlay');
  const dialog = document.querySelector('.hide-distractions-confirm-dialog');
  const target = document.querySelector('.hide-distractions-preview-target');

  if (overlay) {
    if (overlay._escapeHandler) {
      document.removeEventListener('keydown', overlay._escapeHandler);
    }
    overlay.remove();
  }
  if (dialog) dialog.remove();
  if (target) target.classList.remove('hide-distractions-preview-target');
}

// Hide an element using visibility (keeps layout)
function hideElement(selectorOrObject) {
  const selector = typeof selectorOrObject === 'string' ? selectorOrObject : selectorOrObject.selector;
  const elements = document.querySelectorAll(selector);
  elements.forEach(el => {
    el.classList.add('hide-distractions-hidden');
    // Also set pointer-events to none so clicks pass through
    el.style.setProperty('pointer-events', 'none', 'important');
  });
}

// Get element metadata for display
function getElementMetadata(element) {
  const tagName = element.tagName.toLowerCase();
  let textContent = '';

  // Try to get meaningful text content
  if (element.innerText) {
    textContent = element.innerText.trim().substring(0, 100);
  } else if (element.textContent) {
    textContent = element.textContent.trim().substring(0, 100);
  }

  // If no text, try to get some identifying attributes
  if (!textContent) {
    if (element.getAttribute('aria-label')) {
      textContent = element.getAttribute('aria-label');
    } else if (element.getAttribute('title')) {
      textContent = element.getAttribute('title');
    } else if (element.alt) {
      textContent = element.alt;
    }
  }

  return {
    tagName,
    textContent: textContent || `<${tagName}>`
  };
}

// Show a single hidden element by ID
function showElement(id) {
  const elementData = hiddenElements.find(el => el.id === id);
  if (!elementData) return;

  const elements = document.querySelectorAll(elementData.selector);
  elements.forEach(el => {
    el.classList.remove('hide-distractions-hidden');
    el.style.removeProperty('pointer-events');
  });

  hiddenElements = hiddenElements.filter(el => el.id !== id);
  saveHiddenElements();
}

// Show all hidden elements
function showAllElements() {
  const elements = document.querySelectorAll('.hide-distractions-hidden');
  elements.forEach(el => {
    el.classList.remove('hide-distractions-hidden');
    el.style.removeProperty('pointer-events');
  });

  hiddenElements = [];
  saveHiddenElements();
}

// Load hidden elements from storage
function loadHiddenElements() {
  chrome.runtime.sendMessage(
    { action: 'getHiddenElements', hostname: hostname },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error('[Hide Distractions] Error loading elements:', chrome.runtime.lastError.message);
        return;
      }
      if (response && response.hiddenElements) {
        hiddenElements = response.hiddenElements;
        console.log('[Hide Distractions] Loaded', hiddenElements.length, 'hidden elements');
        hiddenElements.forEach(selector => {
          hideElement(selector);
        });
      }
    }
  );
}

// Save hidden elements to storage
function saveHiddenElements() {
  chrome.runtime.sendMessage({
    action: 'saveHiddenElements',
    hostname: hostname,
    hiddenElements: hiddenElements
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('[Hide Distractions] Error saving elements:', chrome.runtime.lastError.message);
      return;
    }
    console.log('[Hide Distractions] Saved', hiddenElements.length, 'elements');
  });
}

// Track which element was right-clicked
document.addEventListener('contextmenu', (e) => {
  clickedElement = e.target;
}, true);

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Hide Distractions] Received message:', request.action);

  try {
    if (request.action === 'hideElement') {
      if (!clickedElement) {
        console.warn('[Hide Distractions] No element was clicked');
        sendResponse({ success: false, error: 'No element clicked' });
        return true;
      }

      // Find the best element to hide (may be a parent of clicked element)
      const bestElement = findBestElementToHide(clickedElement);
      console.log('[Hide Distractions] Target element:', bestElement.tagName);

      // Show preview and wait for confirmation
      showPreviewAndConfirm(bestElement).then((confirmed) => {
        if (confirmed) {
          const selector = getUniqueSelector(bestElement);
          const metadata = getElementMetadata(bestElement);
          console.log('[Hide Distractions] Hiding element:', selector);

          // Check if this selector is already hidden
          const exists = hiddenElements.find(el => el.selector === selector);
          if (!exists) {
            const elementData = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              selector: selector,
              tagName: metadata.tagName,
              textContent: metadata.textContent,
              timestamp: Date.now()
            };

            hiddenElements.push(elementData);
            hideElement(elementData);
            saveHiddenElements();
            console.log('[Hide Distractions] Element hidden successfully');
          } else {
            console.log('[Hide Distractions] Element already hidden');
          }
        } else {
          console.log('[Hide Distractions] User cancelled');
        }

        clickedElement = null;
        sendResponse({ success: true });
      });

      return true; // Will respond asynchronously
    } else if (request.action === 'showElement') {
      console.log('[Hide Distractions] Showing element:', request.id);
      showElement(request.id);
      sendResponse({ success: true });
    } else if (request.action === 'showAllElements') {
      console.log('[Hide Distractions] Showing all elements');
      showAllElements();
      sendResponse({ success: true });
    } else {
      console.warn('[Hide Distractions] Unknown action:', request.action);
      sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('[Hide Distractions] Error in message listener:', error);
    sendResponse({ success: false, error: error.message });
  }

  return true;
});

// Apply hidden elements when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadHiddenElements);
} else {
  loadHiddenElements();
}

// Re-apply hidden elements when DOM changes (for dynamically added elements)
const observer = new MutationObserver(() => {
  hiddenElements.forEach(selector => {
    hideElement(selector);
  });
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

console.log('[Hide Distractions] Content script fully initialized and ready');
