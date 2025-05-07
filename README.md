# Cookie Cleaner for b2clogin.com

A simple Chrome extension that adds a button to your toolbar to instantly clear all cookies for the b2clogin.com domain.

## Installation

1. Download this extension by saving all the files in a folder on your computer.
   - manifest.json
   - popup.html
   - popup.js
   - Create an "icons" folder and save the icon.svg file (you'll need to convert it to PNG files, see below)

2. **Convert the SVG icon to PNG files**
   - You need to convert the SVG icon to PNG files of sizes 16x16, 48x48, and 128x128 pixels.
   - You can use an online converter or image editor for this.
   - Save the PNG files as icon16.png, icon48.png, and icon128.png in the "icons" folder.

3. **Load the extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" by toggling the switch in the top right corner.
   - Click "Load unpacked" and select the folder containing the extension files.
   - The extension should now appear in your extensions list and in the toolbar.

## Usage

1. Click the extension icon in your Chrome toolbar.
2. Click the "Clear b2clogin.com cookies" button in the popup.
3. The status message will show how many cookies were deleted.

## Customization

If you want to clear cookies for a different domain:

1. Open the manifest.json file and update the host_permissions and the extension name.
2. Open the popup.html file and update the button text.
3. Open the popup.js file and update the domain in the chrome.cookies.getAll() function.

## Permissions

This extension requires the following permissions:
- "cookies": To read and delete cookies for b2clogin.com
- "tabs": To access the current tab's URL