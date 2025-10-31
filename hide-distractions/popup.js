// Get current tab info and update UI
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  const url = new URL(tab.url);
  const hostname = url.hostname;

  // Update site info
  document.getElementById('siteInfo').textContent = hostname;

  // Load hidden elements for this site
  chrome.storage.local.get([hostname], (result) => {
    const hiddenElements = result[hostname] || [];
    updateHiddenCount(hiddenElements.length);
    displaySelectors(hiddenElements);
  });

  // Show all hidden elements button
  document.getElementById('showAllButton').addEventListener('click', () => {
    chrome.tabs.sendMessage(tab.id, { action: 'showAllElements' }, () => {
      updateHiddenCount(0);
      displaySelectors([]);
    });
  });

  // Clear all data for this site button
  document.getElementById('clearDataButton').addEventListener('click', () => {
    chrome.storage.local.remove([hostname], () => {
      chrome.tabs.sendMessage(tab.id, { action: 'showAllElements' }, () => {
        updateHiddenCount(0);
        displaySelectors([]);
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

function displaySelectors(selectors) {
  const listElement = document.getElementById('selectorList');

  if (selectors.length === 0) {
    listElement.innerHTML = '<div class="empty-state">No elements are currently hidden</div>';
    return;
  }

  listElement.innerHTML = selectors
    .map(selector => `<div class="selector-item">${escapeHtml(selector)}</div>`)
    .join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
