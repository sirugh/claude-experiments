// Store the element we right-clicked on
let clickedElement = null;
let hiddenElements = []; // Array of {id, selector, tagName, textContent, timestamp}
const hostname = window.location.hostname;

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
      if (response && response.hiddenElements) {
        hiddenElements = response.hiddenElements;
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
  });
}

// Track which element was right-clicked
document.addEventListener('contextmenu', (e) => {
  clickedElement = e.target;
}, true);

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'hideElement' && clickedElement) {
    const selector = getUniqueSelector(clickedElement);
    const metadata = getElementMetadata(clickedElement);

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
    }

    clickedElement = null;
    sendResponse({ success: true });
  } else if (request.action === 'showElement') {
    showElement(request.id);
    sendResponse({ success: true });
  } else if (request.action === 'showAllElements') {
    showAllElements();
    sendResponse({ success: true });
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
