# Creating Icons for the Extension

The extension references four icon sizes in manifest.json:
- icon16.png (16x16)
- icon32.png (32x32)
- icon48.png (48x48)
- icon128.png (128x128)

## Option 1: Use the SVG Template (Recommended)

An SVG icon template is provided in `icon.svg`. You can convert it to PNG files:

### Using Online Tools:
1. Go to https://cloudconvert.com/svg-to-png or similar
2. Upload `icon.svg`
3. Convert to PNG at sizes: 16, 32, 48, and 128 pixels
4. Save the files as icon16.png, icon32.png, icon48.png, and icon128.png

### Using Command Line (if you have ImageMagick):
```bash
convert -background none icon.svg -resize 16x16 icon16.png
convert -background none icon.svg -resize 32x32 icon32.png
convert -background none icon.svg -resize 48x48 icon48.png
convert -background none icon.svg -resize 128x128 icon128.png
```

### Using Inkscape:
```bash
inkscape icon.svg --export-filename=icon16.png -w 16 -h 16
inkscape icon.svg --export-filename=icon32.png -w 32 -h 32
inkscape icon.svg --export-filename=icon48.png -w 48 -h 48
inkscape icon.svg --export-filename=icon128.png -w 128 -h 128
```

## Option 2: Create Your Own Icons

Create your own PNG icons using any image editor:
- 16x16 pixels - Shown in the extension's management page
- 32x32 pixels - Shown in Windows taskbar
- 48x48 pixels - Shown in extensions management page
- 128x128 pixels - Shown in Chrome Web Store (if published) and installation dialog

## Option 3: Skip Icons (Extension Will Still Work)

If you don't want to create icons right now:

1. The extension will still work - Chrome will use a default icon
2. You can remove the icon references from `manifest.json` to prevent warnings:

Remove these sections:
```json
"action": {
  "default_icon": {
    "16": "icon16.png",
    "32": "icon32.png",
    "48": "icon48.png",
    "128": "icon128.png"
  }
},
"icons": {
  "16": "icon16.png",
  "32": "icon32.png",
  "48": "icon48.png",
  "128": "icon128.png"
}
```

Replace with:
```json
"action": {
  "default_popup": "popup.html"
}
```

And completely remove the `"icons"` section.
