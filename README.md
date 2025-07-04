# Cookie Cleaner for SCSA Login

A Chrome extension that adds a button to your toolbar to instantly clear all cookies for the Script Check SA login domains (b2clogin.com and scriptcheck.sa.gov.au).

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

1. When experiencing SCSA login issues, click the extension icon in your Chrome toolbar.
2. Click the "Fix SCSA" button in the popup.
3. The extension will:
   - Find any open tabs for SCSA domains
   - Clear authentication cookies from both domains
   - Automatically redirect any open SCSA tabs to the main login page (https://hp.scriptcheck.sa.gov.au/home)
   - Show you a summary of what was done
4. Your SCSA tabs will now be on the fresh login page - try logging in again!

## What it does

This extension provides an intelligent fix for Script Check SA login issues by:

1. **Detecting open SCSA tabs** - Automatically finds any open tabs for b2clogin.com or scriptcheck.sa.gov.au
2. **Clearing authentication cookies** from both domains:
   - **b2clogin.com** - Microsoft Azure B2C authentication service
   - **scriptcheck.sa.gov.au** - Script Check SA main domain
3. **Redirecting to login page** - Automatically navigates any open SCSA tabs to the main login page (https://hp.scriptcheck.sa.gov.au/home)

This streamlined process ensures you always start fresh from the correct login page after clearing problematic authentication data!

Clearing these cookies can resolve common login issues such as:
- Login page appearing blank or missing text inputs
- Authentication loops or redirects
- Session conflicts
- Cached authentication states

## Customization

If you want to clear cookies for different domains:

1. Open the manifest.json file and update the host_permissions and the extension name.
2. Open the popup.html file and update the button text and help text.
3. Open the popup.js file and update the domains array with your target domains.

## Permissions

This extension requires the following permissions:
- **"cookies"**: To read and delete cookies for the specified domains
- **"tabs"**: To find and refresh open SCSA tabs  
- **"activeTab"**: To interact with the currently active tab

## Troubleshooting

If the extension doesn't seem to work:
1. Make sure you've enabled Developer mode in Chrome extensions
2. Check that all files are in the correct locations
3. Verify the PNG icon files are properly converted and named
4. Try reloading the extension from the chrome://extensions/ page
