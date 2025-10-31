// Get current tab info and update UI
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  const url = new URL(tab.url);
  const hostname = url.hostname;

  // Update site info
  document.getElementById('siteInfo').textContent = hostname;

  // Load and display hidden elements
  function loadElements() {
    chrome.storage.local.get([hostname], (result) => {
      const hiddenElements = result[hostname] || [];
      updateHiddenCount(hiddenElements.length);
      displayElements(hiddenElements, tab.id);
    });
  }

  loadElements();

  // Show all hidden elements button
  document.getElementById('showAllButton').addEventListener('click', () => {
    chrome.tabs.sendMessage(tab.id, { action: 'showAllElements' }, () => {
      if (chrome.runtime.lastError) {
        console.log('Could not send message:', chrome.runtime.lastError.message);
      }
      loadElements();
    });
  });

  // Clear all data for this site button
  document.getElementById('clearDataButton').addEventListener('click', () => {
    chrome.storage.local.remove([hostname], () => {
      chrome.tabs.sendMessage(tab.id, { action: 'showAllElements' }, () => {
        if (chrome.runtime.lastError) {
          console.log('Could not send message:', chrome.runtime.lastError.message);
        }
        loadElements();
      });
    });
  });
});

function updateHiddenCount(count) {
  const countElement = document.getElementById('hiddenCount');
  if (count === 0) {
    countElement.textContent = 'No hidden elements';
  } else if (count === 1) {
    countElement.textContent = '1 hidden element';
  } else {
    countElement.textContent = `${count} hidden elements`;
  }
}

function displayElements(elements, tabId) {
  const tableElement = document.getElementById('elementsTable');

  if (elements.length === 0) {
    tableElement.innerHTML = '<div class="empty-state">No elements are currently hidden</div>';
    return;
  }

  // Sort by timestamp (newest first)
  const sortedElements = [...elements].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  tableElement.innerHTML = sortedElements
    .map(element => {
      // Handle both old format (string) and new format (object)
      const isObject = typeof element === 'object';
      const selector = isObject ? element.selector : element;
      const tagName = isObject ? element.tagName : 'unknown';
      const textContent = isObject ? element.textContent : selector;
      const id = isObject ? element.id : null;
      const timestamp = isObject && element.timestamp ? formatTimestamp(element.timestamp) : '';

      return `
        <div class="element-row" data-id="${escapeHtml(id || '')}">
          <div class="element-info">
            <div class="element-tag">&lt;${escapeHtml(tagName)}&gt;</div>
            <div class="element-description">${escapeHtml(textContent)}</div>
            <div class="element-selector">${escapeHtml(selector)}</div>
            ${timestamp ? `<div class="element-timestamp">${timestamp}</div>` : ''}
          </div>
          <button class="remove-button" data-id="${escapeHtml(id || '')}" title="Show this element">−</button>
        </div>
      `;
    })
    .join('');

  // Add click handlers to remove buttons
  tableElement.querySelectorAll('.remove-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      if (id) {
        chrome.tabs.sendMessage(tabId, { action: 'showElement', id: id }, () => {
          if (chrome.runtime.lastError) {
            console.log('Could not send message:', chrome.runtime.lastError.message);
          }
          // Reload elements after removing
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            const url = new URL(tab.url);
            const hostname = url.hostname;

            chrome.storage.local.get([hostname], (result) => {
              const hiddenElements = result[hostname] || [];
              updateHiddenCount(hiddenElements.length);
              displayElements(hiddenElements, tab.id);
            });
          });
        });
      }
    });
  });
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  // Less than a minute
  if (diff < 60000) {
    return 'Just now';
  }

  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }

  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }

  // More than a day
  const days = Math.floor(diff / 86400000);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
