(() => {
  'use strict';

  const MODE_KEY = 'frameMode';
  const COLOR_KEY = 'frameColor';
  const LOCAL_CACHE_KEY = '__crd_pwa_frame_color_v3__';
  const LIGHT_COLOR = '#fafafa';
  const DARK_COLOR = '#212121';

  let currentMode = 'auto';
  let manualColor = LIGHT_COLOR;
  let activeColor = LIGHT_COLOR;

  function detectThemeColorFromStorage() {
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith('dark-mode$')) {
          const val = window.localStorage.getItem(k);
          if (val === 'true') return DARK_COLOR;
          if (val === 'false') return LIGHT_COLOR;
        }
      }
      const cached = window.localStorage.getItem(LOCAL_CACHE_KEY);
      if (cached && /^#[0-9a-fA-F]{6}$/.test(cached)) {
        return cached.toLowerCase();
      }
    } catch (_) {}
    return LIGHT_COLOR;
  }

  function detectThemeColorFromDom() {
    if (!document.body) return null;

    if (document.body.classList.contains('fv4cze')) {
      return DARK_COLOR;
    }
    if (document.body.classList.contains('afF7cb')) {
      return LIGHT_COLOR;
    }

    try {
      const pageBg = window.getComputedStyle(document.body).getPropertyValue('--page-bg-color').trim();
      if (pageBg && /^#[0-9a-fA-F]{6}$/.test(pageBg)) {
        return pageBg.toLowerCase();
      }
    } catch (_) {}

    return null;
  }

  activeColor = detectThemeColorFromStorage();

  let applying = false;

  function applyFrameColor(color) {
    if (applying || !color) return;
    applying = true;
    try {
      const targetRoot = document.head || document.documentElement;
      if (!targetRoot) return;

      const metas = document.querySelectorAll('meta[name="theme-color"]');
      if (metas.length === 0) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        meta.setAttribute('content', color);
        targetRoot.appendChild(meta);
      } else {
        metas.forEach((meta, index) => {
          if (index === 0) {
            if (meta.getAttribute('content') !== color) {
              meta.setAttribute('content', color);
            }
            if (meta.hasAttribute('media')) {
              meta.removeAttribute('media');
            }
          } else {
            meta.remove();
          }
        });
      }
    } finally {
      applying = false;
    }
  }

  function persistDetectedColor(color) {
    try {
      window.localStorage.setItem(LOCAL_CACHE_KEY, color);
    } catch (_) {}
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get({ [COLOR_KEY]: '' }, (items) => {
        if (items[COLOR_KEY] !== color) {
          chrome.storage.sync.set({ [COLOR_KEY]: color });
        }
      });
    }
  }

  function refreshColor() {
    if (currentMode === 'manual') {
      activeColor = manualColor;
      try {
        window.localStorage.setItem(LOCAL_CACHE_KEY, activeColor);
      } catch (_) {}
      applyFrameColor(activeColor);
      return;
    }

    const domColor = detectThemeColorFromDom();
    const nextColor = domColor || detectThemeColorFromStorage();
    if (nextColor !== activeColor) {
      activeColor = nextColor;
      persistDetectedColor(activeColor);
    }
    applyFrameColor(activeColor);
  }

  applyFrameColor(activeColor);

  const observer = new MutationObserver(() => {
    refreshColor();
  });

  function startObserver() {
    if (!document.documentElement) return;
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['content', 'name', 'media', 'class', 'style']
    });
    refreshColor();
  }

  if (document.documentElement) {
    startObserver();
  } else {
    document.addEventListener('DOMContentLoaded', startObserver, { once: true });
  }

  window.addEventListener('load', () => {
    refreshColor();
    setTimeout(refreshColor, 500);
  });

  window.addEventListener('storage', refreshColor);

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get({ [MODE_KEY]: 'auto', [COLOR_KEY]: LIGHT_COLOR }, (items) => {
      currentMode = items[MODE_KEY] === 'manual' ? 'manual' : 'auto';
      if (items[COLOR_KEY] && /^#[0-9a-fA-F]{6}$/.test(items[COLOR_KEY])) {
        manualColor = items[COLOR_KEY].toLowerCase();
      }
      refreshColor();
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync') {
        if (changes[MODE_KEY]) {
          currentMode = changes[MODE_KEY].newValue === 'manual' ? 'manual' : 'auto';
        }
        if (changes[COLOR_KEY] && changes[COLOR_KEY].newValue && /^#[0-9a-fA-F]{6}$/.test(changes[COLOR_KEY].newValue)) {
          manualColor = changes[COLOR_KEY].newValue.toLowerCase();
        }
        refreshColor();
      }
    });
  }
})();
