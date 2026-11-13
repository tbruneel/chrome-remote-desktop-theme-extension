# Title Bar Theme for Chrome Remote Desktop (`chrome-extension-theme-for-remote-desktop`)

A zero-configuration Manifest V3 Chrome extension that automatically synchronizes the window frame (title bar) and launch splash color of the **Google Chrome Remote Desktop** Web App (`https://remotedesktop.google.com/`).

---

## Background

By default, `https://remotedesktop.google.com/` omits `<meta name="theme-color">` from its HTML `<head>` and omits `theme_color` from `/_/RemotingUi/manifest.json`, causing Chrome to render the standalone PWA window with an unmatched default title bar.

This extension automatically detects Chrome Remote Desktop's active Light/Dark theme (`body.afF7cb`, `body.fv4cze`, `--page-bg-color`, and `localStorage['dark-mode$*']`) as well as active modal dialog scrims (`.llhEMd.iWO5td`), keeping `<meta name="theme-color">` and the manifest `theme_color` / `background_color` synchronized in real time:

| Theme | Base Header Color | Dialog Open (`50%` Scrim) |
| :--- | :--- | :--- |
| **Light** | `#fafafa` (`rgb(250, 250, 250)`) | `#7d7d7d` (`rgb(125, 125, 125)`) |
| **Dark** | `#212121` (`rgb(33, 33, 33)`) | `#111111` (`rgb(17, 17, 17)`) |

---

## Repository Structure

```text
chrome-extension-theme-for-remote-desktop/
├── .agents/
│   └── rules/
│       └── rules-git.md            # Git commit identity rules
├── icons/
│   ├── icon16.png                  # Extension toolbar / management icons
│   ├── icon48.png
│   └── icon128.png                 # Chrome Web Store listing icon
├── store/
│   └── screenshot-1280x800.png     # Chrome Web Store listing screenshot (24-bit PNG)
├── src/
│   ├── background.js               # Manifest redirect rule & live tab re-injection on reload
│   ├── content.js                  # Top-frame theme + dialog scrim observer & <meta> lock
│   └── shared.js                   # Shared constants, hex validation, color blending & DOM helpers
├── build.ps1                       # Packages CWS-ready .zip bundle into dist\ (forward-slash entries)
├── manifest.json                   # Chrome Extension Manifest V3
├── privacy.md                      # Chrome Web Store privacy policy
├── readme.md                       # Documentation (Markdown source)
└── readme.md.html                  # Documentation (Standalone HTML)
```

---

## Packaging & Deployment

### Chrome Web Store Packaging (`.zip`)

Run `.\build.ps1` to produce `dist\chrome-extension-theme-for-remote-desktop-v<version>.zip` with `manifest.json` at the root and forward-slash (`/`) entry paths ready for upload in the Chrome Web Store Developer Dashboard.

### Automated Provisioning (`powershell-software-installer`)

Chrome Web Store Extension ID: `goeedkphpabkkmajcmngohomgmdodgaf` (configured in `powershell-software-installer\manifest.psd1` under `winget_google_chrome_remote_desktop`), so [`winget_google_chrome_remote_desktop.ps1`](../powershell-software-installer/readme.md) installs the Remote Desktop Host MSI, Chrome PWA, official Chrome Remote Desktop extension, and this extension automatically via Chrome Enterprise Policy (`HKLM:\SOFTWARE\Policies\Google\Chrome\ExtensionSettings`, mode `normal_installed`).

### Local Development (Unpacked Extension)

1. Open `chrome://extensions/` in Google Chrome.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked** and select `D:\Development\chrome-extension-theme-for-remote-desktop` (or click **Reload (`↻`)** if already loaded).
4. Open the **Chrome Remote Desktop** web app (`https://remotedesktop.google.com/access/`) — the window frame automatically matches your active Light/Dark theme (`#fafafa` or `#212121`) and dims seamlessly when modal dialogs open.
