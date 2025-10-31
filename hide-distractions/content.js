// Store the element we right-clicked on
let clickedElement = null;
let hiddenElements = [];
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
function hideElement(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(el => {
    el.classList.add('hide-distractions-hidden');
    // Also set pointer-events to none so clicks pass through
    el.style.setProperty('pointer-events', 'none', 'important');
  });
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

    if (!hiddenElements.includes(selector)) {
      hiddenElements.push(selector);
      hideElement(selector);
      saveHiddenElements();
    }

    clickedElement = null;
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
