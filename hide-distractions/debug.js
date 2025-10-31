// Debug script to check if content script is loaded
// Run this in the page console (F12) to check content script status

console.log('=== Hide Distractions Debug ===');
console.log('Window location:', window.location.href);
console.log('Looking for content script...');

// Try to send a message to the background to see if content script can respond
chrome.runtime.sendMessage({ action: 'ping' }, (response) => {
  if (chrome.runtime.lastError) {
    console.error('ERROR: Cannot communicate with extension:', chrome.runtime.lastError.message);
  } else {
    console.log('Extension communication works!');
  }
});

// Check if the content script's CSS is loaded
const hiddenElements = document.querySelectorAll('.hide-distractions-hidden');
console.log('Found', hiddenElements.length, 'hidden elements');

// Check if the content script added any listeners
console.log('Document has', window.getEventListeners ? window.getEventListeners(document).contextmenu?.length : 'unknown', 'contextmenu listeners');
