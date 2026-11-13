# Privacy Policy — Title Bar Theme for Chrome Remote Desktop

**Effective Date:** 2026-11-13  
**Extension ID:** `goeedkphpabkkmajcmngohomgmdodgaf`  
**Repository:** https://github.com/tbruneel/chrome-extension-theme-for-remote-desktop

## Overview

**Title Bar Theme for Chrome Remote Desktop** is designed strictly to synchronize the browser window frame (title bar) and launch splash color with the active theme of the Chrome Remote Desktop web application.

## Data Collection & Usage

This extension **does not collect, store, transmit, sell, or share any personal, sensitive, or usage data**. Specifically:

- No personally identifiable information, credentials, remote host details, browsing history, keystrokes, or page content are collected or read beyond detecting the active Light/Dark theme state and modal dialog scrim.
- No analytics, telemetry, tracking pixels, or external network requests are used.
- No third-party services receive any data from this extension.

## Local Processing & Browser Storage

All operations run locally inside your browser and are strictly limited to `https://remotedesktop.google.com/*`:

- The extension reads the active page Light/Dark theme and modal overlay state locally in memory to update the page `<meta name="theme-color">` tag and the web app manifest theme colors via local dynamic redirect rules.
- Only a 7-character `#RRGGBB` hex color string (such as `#fafafa` or `#212121`) is saved locally in browser page `localStorage` and `chrome.storage.sync` so the title bar color persists cleanly across launches without flickering.

## Changes to This Policy

Updates to this privacy policy will be published in this repository alongside the extension source code.
