(() => {
  'use strict';

  const Shared = globalThis.FrameColorShared;
  if (!Shared || !Shared.claimRuntimeGuard('__frameColorContentGuard__')) {
    return;
  }

  const LOCAL_CACHE_KEY = '__crd_frame_color_cache__';
  const LEGACY_CACHE_KEYS = ['__crd_pwa_frame_color_v3__'];

  const LIGHT_COLOR = '#fafafa'; // rgb(250, 250, 250)
  const DARK_COLOR  = '#212121'; // rgb(33, 33, 33)

  let tornDown = false;
  let activeColor = Shared.DEFAULT_COLOR;
  let lastSyncedStorageColor = '';

  function readCachedColor() {
    try {
      const direct = window.localStorage.getItem(LOCAL_CACHE_KEY);
      if (Shared.isValidHexColor(direct)) {
        return direct.toLowerCase();
      }
      for (const legacyKey of LEGACY_CACHE_KEYS) {
        const legacy = window.localStorage.getItem(legacyKey);
        if (Shared.isValidHexColor(legacy)) {
          const normalized = legacy.toLowerCase();
          window.localStorage.setItem(LOCAL_CACHE_KEY, normalized);
          window.localStorage.removeItem(legacyKey);
          return normalized;
        }
      }
    } catch (_) {}
    return null;
  }

  function detectFallbackStorageColor() {
    const cached = readCachedColor();
    if (cached) return cached;

    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith('dark-mode$')) {
          const val = window.localStorage.getItem(k);
          if (val === 'true') return DARK_COLOR;
          if (val === 'false') return LIGHT_COLOR;
        }
      }
    } catch (_) {}

    return LIGHT_COLOR;
  }

  function resolveBaseRgbFromDom() {
    if (!document.body) return null;

    if (document.body.classList.contains('fv4cze')) {
      return [33, 33, 33]; // #212121
    }
    if (document.body.classList.contains('afF7cb')) {
      return [250, 250, 250]; // #fafafa
    }

    try {
      const pageBg = window.getComputedStyle(document.body).getPropertyValue('--page-bg-color');
      if (pageBg) {
        const rgb = Shared.resolveOpaqueRgb(pageBg);
        if (rgb) return rgb;
      }
    } catch (_) {}

    return null;
  }

  function detectActiveOverlay() {
    try {
      // Google Wiz modal dialog scrim (`.llhEMd.iWO5td`, rgba(0, 0, 0, 0.5), z-index: 5000)
      const scrims = document.querySelectorAll('.llhEMd.iWO5td');
      for (const scrim of scrims) {
        if (scrim.getAttribute('aria-hidden') === 'true') continue;
        const style = window.getComputedStyle(scrim);
        if (style.display === 'none' || style.visibility === 'hidden' || style.pointerEvents === 'none') {
          continue;
        }
        return Shared.parseCssColorWithAlpha(style.backgroundColor) || { r: 0, g: 0, b: 0, a: 0.5 };
      }
    } catch (_) {}
    return null;
  }

  function detectLiveThemeColors() {
    const domRgb = resolveBaseRgbFromDom();
    const baseRgb = domRgb || Shared.resolveOpaqueRgb(detectFallbackStorageColor()) || [250, 250, 250];
    const baseColor = Shared.rgbToHex(baseRgb[0], baseRgb[1], baseRgb[2]);
    const overlay = domRgb ? detectActiveOverlay() : null;
    const displayColor = overlay ? Shared.blendOverlayOntoBase(baseRgb, overlay) : baseColor;
    return { displayColor, baseColor };
  }

  function syncBaseColorToStorage(baseColor) {
    if (!Shared.isValidHexColor(baseColor)) return;
    const normalized = baseColor.toLowerCase();

    try {
      window.localStorage.setItem(LOCAL_CACHE_KEY, normalized);
    } catch (_) {}

    if (normalized === lastSyncedStorageColor) {
      return;
    }
    if (!Shared.isContextValid() || !chrome.storage || !chrome.storage.sync) {
      return;
    }

    lastSyncedStorageColor = normalized;
    try {
      chrome.storage.sync.get({ [Shared.COLOR_KEY]: '' }, (items) => {
        if (!Shared.isContextValid() || !items) return;
        if (items[Shared.COLOR_KEY] !== normalized) {
          chrome.storage.sync.set({ [Shared.COLOR_KEY]: normalized });
        }
      });
    } catch (_) {}
  }

  function refreshColor() {
    if (!Shared.isContextValid()) {
      teardown();
      return;
    }

    const { displayColor, baseColor } = detectLiveThemeColors();
    activeColor = displayColor;
    syncBaseColorToStorage(baseColor);
    Shared.applyThemeColorMeta(activeColor);
  }

  // Apply startup color immediately at document_start to prevent any title bar flash
  activeColor = detectFallbackStorageColor();
  Shared.applyThemeColorMeta(activeColor);

  const observer = new MutationObserver(refreshColor);

  function teardown() {
    if (tornDown) return;
    tornDown = true;
    try {
      observer.disconnect();
    } catch (_) {}
    window.removeEventListener('storage', refreshColor);
  }

  window.addEventListener('storage', refreshColor);

  function startObserver() {
    if (!document.documentElement || !Shared.isContextValid()) return;
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['content', 'name', 'media', 'class', 'style', 'aria-hidden']
    });
    refreshColor();
  }

  if (document.documentElement) {
    startObserver();
  } else {
    document.addEventListener('DOMContentLoaded', startObserver, { once: true });
  }

  window.addEventListener('load', refreshColor);
})();
