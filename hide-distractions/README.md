# Hide Distracting Elements - Chrome Extension

A Chrome extension that lets you hide distracting elements on web pages without affecting page layout. Similar to Safari's "hide distracting elements" feature.

## Features

- **Right-click to hide**: Right-click any element and select "Hide This Element" from the context menu
- **Preview before hiding**: See exactly what will be hidden with a teal highlight and confirmation dialog
- **Smart element detection**: Automatically detects the best element to hide (e.g., hides the entire button, not just the text inside)
- **Maintains layout**: Hidden elements become invisible but don't reflow the page layout
- **Blocks interactions**: Hidden elements won't block clicks or interactions (useful for cookie notices, modal overlays, etc.)
- **Persistent**: Hidden elements stay hidden across page reloads
- **Per-site storage**: Each website remembers its own hidden elements
- **Individual element management**: View all hidden elements with descriptions and selectively unhide them
- **Smart metadata**: Automatically captures element information (tag, text, selector) for easy identification
- **Timestamps**: See when each element was hidden

## Installation

Since this is a local development extension (not published to the Chrome Web Store), you need to install it manually:

1. **Open Chrome Extensions page**:
   - Navigate to `chrome://extensions/`
   - Or: Menu (⋮) → More Tools → Extensions

2. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the extension**:
   - Click "Load unpacked"
   - Navigate to the `hide-distractions` folder
   - Click "Select Folder"

4. **Create icons** (optional):
   - The extension references icon files (icon16.png, icon32.png, icon48.png, icon128.png)
   - You can create simple icon images or use the provided icon.svg as a template
   - Alternatively, remove the icon references from manifest.json if you don't want to create icons

## How to Use

### Hiding Elements

1. Right-click on any distracting element (ad, cookie notice, modal, etc.)
2. Select **"Hide This Element"** from the context menu
3. A preview will appear:
   - The page will blur/dim
   - The target element will be highlighted with a **teal outline**
   - The element will scroll into view if needed
4. Review the confirmation dialog showing:
   - Element type (tag name)
   - Preview of the element's text content
5. Click **"Hide Element"** to confirm, or **"Cancel"** to abort (or press Escape)
6. The element will become invisible but won't affect page layout

**Smart Detection**: If you click on text inside a button or link, the extension automatically detects and highlights the entire interactive element, not just the text.

### Managing Hidden Elements

1. Click the extension icon in your toolbar
2. View a detailed list of all hidden elements on the current site, including:
   - Element type (tag name like `<div>`, `<button>`, etc.)
   - Element description (text content or identifying attributes)
   - CSS selector used to hide the element
   - When the element was hidden
3. Click the **"−" button** next to any element to unhide just that element
4. Use **"Show All Hidden Elements"** to restore all hidden elements at once
5. Use **"Clear All Data for This Site"** to remove all saved rules

### Use Cases

- Cookie consent banners
- "Sign up for newsletter" popups
- Annoying sticky headers
- Auto-playing video overlays
- Ad blockers detection notices
- Any distracting page element

## Technical Details

### How It Works

- **Content Script**: Runs on all web pages, tracking right-clicks and applying CSS rules
- **Background Script**: Manages the context menu and storage
- **Storage**: Uses Chrome's local storage API to persist hidden elements per hostname
- **CSS**: Uses `opacity: 0`, `visibility: hidden`, and `pointer-events: none` to hide elements without removing them from the DOM
- **Mutation Observer**: Watches for dynamically added elements and re-applies hiding rules

### Why Not Remove Elements?

This extension makes elements invisible rather than removing them from the DOM because:

1. **Layout preservation**: Removing elements causes the page to reflow, which can be jarring
2. **Click-through**: By setting `pointer-events: none`, you can still interact with content behind overlays
3. **Compatibility**: Some websites break if certain elements are removed
4. **Reversibility**: It's easier to show/hide elements than to restore removed ones

## Files

- `manifest.json` - Extension configuration
- `background.js` - Service worker for context menu and storage
- `content.js` - Injected script that handles element hiding
- `content.css` - CSS rules for hiding elements
- `popup.html` - Extension popup UI
- `popup.js` - Popup UI logic
- `README.md` - This file

## Permissions

- `contextMenus`: To add "Hide This Element" to the right-click menu
- `storage`: To save hidden elements across sessions
- `activeTab`: To interact with the current tab
- `<all_urls>`: To run on all websites (required for content script)

## Troubleshooting

### Extension not working?

1. Make sure you've enabled the extension in `chrome://extensions/`
2. Reload the page you're trying to use it on
3. Check the console for any errors

### Element not hiding?

1. Try right-clicking directly on the element
2. Some elements might be dynamically generated - try hiding after the page fully loads
3. Check if the element has a unique, stable selector

### Hidden elements showing again?

1. Check if the site changes its DOM structure dynamically
2. Try hiding the parent element instead
3. Clear the extension data and try hiding again

## Privacy

This extension:
- Only stores CSS selectors (not page content)
- Stores data locally in your browser (not sent anywhere)
- Does not track or collect any user data
- Does not make any network requests

## License

This is a personal experiment and is provided as-is for personal use.
