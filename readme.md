# Google Chrome Remote Desktop Extension (`google-chrome-remote-desktop-extension`)

A lightweight Manifest V3 Chrome extension whose sole purpose is to set and lock the window frame (title bar) color of the **Google Chrome Remote Desktop** Web App (`https://remotedesktop.google.com/`).

---

## Background

By default, `https://remotedesktop.google.com/` omits `<meta name="theme-color">` from its HTML `<head>` and omits `theme_color` from `/_/RemotingUi/manifest.json`. This extension injects and locks `<meta name="theme-color">` at `document_start` so the standalone PWA window frame color can be explicitly controlled (defaulting to `#ffffff` white, or any custom hex color selected via the extension popup).

---

## Repository Structure

```text
google-chrome-remote-desktop-extension/
├── .agents/
│   └── rules/
│       └── rules-git.md            # Git commit identity rules
├── src/
│   ├── content.js                  # document_start theme-color injection & MutationObserver
│   ├── popup.css                   # Extension popup styles
│   ├── popup.html                  # Extension popup markup
│   └── popup.js                    # Color picker, hex input & preset swatches
├── manifest.json                   # Chrome Extension Manifest V3
├── readme.md                       # Documentation (Markdown source)
└── readme.md.html                  # Documentation (Standalone HTML)
```

---

## Installation (Unpacked Extension)

1. Open `chrome://extensions/` in Google Chrome.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked** and select `D:\Development\google-chrome-remote-desktop-extension`.
4. Open the **Chrome Remote Desktop** web app (`https://remotedesktop.google.com/access/`) — the window frame color can be customized at any time via the extension icon in the title bar.
