'use strict';

const STORAGE_KEY = 'frameColor';
const DEFAULT_COLOR = '#ffffff';
const RULE_ID = 1;

function buildManifestDataUrl(color) {
  const manifest = {
    name: 'Chrome Remote Desktop',
    short_name: 'Remote Desktop',
    start_url: 'https://remotedesktop.google.com/?entry-point=pwa&lfhs=2',
    display: 'standalone',
    orientation: 'any',
    background_color: color,
    theme_color: color,
    icons: [
      {
        src: 'https://www.gstatic.com/chromoting/chromoting_logo_512.png',
        type: 'image/png',
        sizes: '512x512'
      },
      {
        src: 'https://www.gstatic.com/chromoting/chromoting_logo_192.png',
        type: 'image/png',
        sizes: '192x192'
      }
    ],
    id: '/?entry-point=pwa&lfhs=2'
  };
  return 'data:application/manifest+json;charset=utf-8,' + encodeURIComponent(JSON.stringify(manifest));
}

function updateManifestRedirectRule(color) {
  const validColor = (color && /^#[0-9a-fA-F]{6}$/.test(color)) ? color.toLowerCase() : DEFAULT_COLOR;
  const redirectUrl = buildManifestDataUrl(validColor);

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID],
    addRules: [
      {
        id: RULE_ID,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: { url: redirectUrl }
        },
        condition: {
          urlFilter: 'https://remotedesktop.google.com/_/RemotingUi/manifest.json*',
          resourceTypes: ['other', 'xmlhttprequest', 'sub_frame', 'main_frame']
        }
      }
    ]
  });
}

function syncRuleFromStorage() {
  chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULT_COLOR }, (items) => {
    updateManifestRedirectRule(items[STORAGE_KEY]);
  });
}

chrome.runtime.onInstalled.addListener(syncRuleFromStorage);
chrome.runtime.onStartup.addListener(syncRuleFromStorage);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes[STORAGE_KEY]) {
    updateManifestRedirectRule(changes[STORAGE_KEY].newValue);
  }
});

syncRuleFromStorage();
