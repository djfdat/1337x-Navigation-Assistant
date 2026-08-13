/**
 * Content-script entry point for keyboard-driven pagination.
 *
 * The script intentionally stays dependency-free: it runs in an isolated extension
 * context and delegates only persistence to Chrome and rendering to the page DOM.
 */
(function initializeNavigationAssistant() {
  'use strict';

  // Configuration and selectors shared across navigation, settings, and UI helpers.
  const INITIALIZATION_FLAG = '__1337xNavigationAssistantInitialized';
  // Only run on category and subcategory listing pages, which are the only pages with pagination.
  const ELIGIBLE_PATH_PATTERN = /^\/(?:cat|sub)(?:\/|$)/i;
  // Settings defaults are used as an allow-list to prevent unrelated storage values from entering state.
  const SETTINGS_DEFAULTS = Object.freeze({
    enabled: true,
    showToast: true,
    enableAltKeys: false
  });
  const ACTIVE_PAGE_SELECTOR = '.pagination li.active, .pager li.active';
  // Toast UI constants are used to create a single, reusable status element.
  const TOAST_ID = 'nav-1337x-toast-hud';
  // Toast duration is intentionally short to avoid obscuring page content during rapid navigation.
  const TOAST_DURATION_MS = 1200;
  // Navigation fallback delay is intentionally short to avoid a perceptible pause when the site's click handler works as expected.
  const NAVIGATION_FALLBACK_DELAY_MS = 150;

  // Run only on supported listing pages and guard against duplicate script injection.
  if (!ELIGIBLE_PATH_PATTERN.test(window.location.pathname)) return;
  if (globalThis[INITIALIZATION_FLAG]) return;
  globalThis[INITIALIZATION_FLAG] = true;

  // Runtime state mirrors persisted settings and locks shortcuts during navigation.
  const state = {
    ...SETTINGS_DEFAULTS,
    isNavigating: false
  };
  let toastTimer = null;

  // Settings persistence and live synchronization with the extension options UI.
  function reportChromeError(context) {
    const error = chrome.runtime.lastError;
    if (error) console.warn(`[1337x Navigation Assistant] ${context}: ${error.message}`);
  }

  // Apply only known settings to the runtime state, ignoring unrelated storage values.
  function applySettings(settings) {
    // Treat defaults as an allow-list so unrelated storage values never enter state.
    for (const key of Object.keys(SETTINGS_DEFAULTS)) {
      if (settings[key] !== undefined) state[key] = Boolean(settings[key]);
    }
  }

  // Load persisted settings from Chrome storage and apply them to the runtime state.
  function loadSettings() {
    chrome.storage.sync.get(SETTINGS_DEFAULTS, (settings) => {
      if (chrome.runtime.lastError) {
        reportChromeError('Unable to load settings');
        return;
      }

      applySettings(settings);
    });
  }

  // Update runtime state when settings change in the extension options UI or another content script.
  function handleSettingsChange(changes, areaName) {
    if (areaName !== 'sync') return;

    const updatedSettings = {};
    for (const key of Object.keys(SETTINGS_DEFAULTS)) {
      if (changes[key]) updatedSettings[key] = changes[key].newValue;
    }
    applySettings(updatedSettings);
  }

  // Determine whether the target element is a text-entry field that should not be hijacked by the extension.
  function isEditableTarget(target) {
    const element = target instanceof Element ? target : document.activeElement;
    if (!(element instanceof Element)) return false;

    // Use the closest() method to check for ancestor text-entry fields, including contenteditable elements.
    return Boolean(
      element.closest('input, textarea, select, [role="textbox"]') ||
      element.closest('[contenteditable]:not([contenteditable="false"])') ||
      element.isContentEditable
    );
  }

  // Pagination discovery uses the links adjacent to the active page indicator.
  function isDisabled(link) {
    const listItem = link.closest('li');

    // Treat both the link and its parent list item as disabled if either has a disabled class or aria-disabled attribute.
    return (
      link.matches('.disabled, [aria-disabled="true"]') ||
      Boolean(listItem?.matches('.disabled, [aria-disabled="true"]'))
    );
  }

  // Return the first eligible link from a pagination item, or null if none exists.
  function getLinkFromItem(item) {
    if (!(item instanceof Element)) return null;

    const link = item.matches('a') ? item : item.querySelector('a');
    return link && !isDisabled(link) ? link : null;
  }

  // Resolve the previous and next pages from the active page's immediate siblings.
  function getPaginationLinks() {
    const activeItem = document.querySelector(ACTIVE_PAGE_SELECTOR);
    const previous = getLinkFromItem(activeItem?.previousElementSibling);
    const next = getLinkFromItem(activeItem?.nextElementSibling);

    return { previous, next };
  }

  // Lazily create and update the accessible navigation status toast.
  function getToastIcon(type) {
    if (type === 'prev') return '◀';
    if (type === 'next') return '▶';
    if (type === 'warning') return '!';
    return 'ℹ';
  }

  // Lazily create a single toast element for the extension to reuse across navigation events.
  function getOrCreateToast() {
    const existingToast = document.getElementById(TOAST_ID);
    if (existingToast) return existingToast;

    const toast = document.createElement('div');
    const content = document.createElement('div');
    const icon = document.createElement('span');
    const text = document.createElement('span');

    toast.id = TOAST_ID;
    toast.className = 'nav-1337x-toast';
    // Announce updates without moving focus away from the current page content.
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-atomic', 'true');
    content.className = 'nav-1337x-toast-content';
    icon.className = 'nav-1337x-toast-icon';
    icon.setAttribute('aria-hidden', 'true');
    text.className = 'nav-1337x-toast-text';
    content.append(icon, text);
    toast.append(content);
    document.body.append(toast);

    return toast;
  }

  // Display a temporary toast message to indicate navigation progress or status.
  function showNavigationToast(message, type = 'info') {
    if (!state.showToast) return;

    const toast = getOrCreateToast();
    // Reset the toast's class to ensure the correct type and visibility are applied.
    toast.className = `nav-1337x-toast nav-1337x-toast-${type} nav-1337x-toast-visible`;
    toast.querySelector('.nav-1337x-toast-icon').textContent = getToastIcon(type);
    toast.querySelector('.nav-1337x-toast-text').textContent = message;

    // Reset the timer so the toast remains visible for the full duration after each update.
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove('nav-1337x-toast-visible');
    }, TOAST_DURATION_MS);
  }

  // Trigger page navigation while preserving a URL fallback for cancelled clicks.
  function navigateTo(link, direction) {
    const isPrevious = direction === 'prev';
    if (!link) {
      showNavigationToast(isPrevious ? 'First page reached' : 'Last page reached', 'warning');
      return;
    }

    state.isNavigating = true;
    const message = isPrevious ? 'Navigating: Previous Page' : 'Navigating: Next Page';
    showNavigationToast(message, direction);

    const rawHref = link.getAttribute('href');
    const destination = link.href;

    // Prefer a real click so the site's own pagination handlers still run.
    try {
      link.click();
    } catch (error) {
      if (destination) {
        window.location.assign(destination);
        return;
      }
      state.isNavigating = false;
      console.warn('[1337x Navigation Assistant] Pagination click failed.', error);
      return;
    }

    // Script-driven controls have no safe URL fallback; allow another attempt if
    // their click handler keeps the user on the current page.
    if (!rawHref || rawHref === '#' || rawHref.toLowerCase().startsWith('javascript:')) {
      window.setTimeout(() => {
        state.isNavigating = false;
      }, NAVIGATION_FALLBACK_DELAY_MS);
      return;
    }

    // Some page scripts cancel anchor clicks. Direct navigation preserves the
    // shortcut's expected behavior when that happens.
    window.setTimeout(() => {
      if (window.location.href !== destination) window.location.assign(destination);
    }, NAVIGATION_FALLBACK_DELAY_MS);
  }

  // Map arrow keys and the optional A/D and bracket shortcuts to a direction.
  function getDirectionForKey(key) {
    if (key === 'ArrowLeft') return 'prev';
    if (key === 'ArrowRight') return 'next';
    if (!state.enableAltKeys) return null;

    const normalizedKey = key.toLowerCase();
    if (normalizedKey === 'a' || key === '[') return 'prev';
    if (normalizedKey === 'd' || key === ']') return 'next';
    return null;
  }

  function handleKeyDown(event) {
    // Leave repeated, modified, handled, and text-entry keystrokes to the page.
    if (!state.enabled || state.isNavigating || event.repeat || event.defaultPrevented) return;
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.composedPath().some(isEditableTarget)) return;

    const direction = getDirectionForKey(event.key);
    if (!direction) return;

    const { previous, next } = getPaginationLinks();
    event.preventDefault();
    navigateTo(direction === 'prev' ? previous : next, direction);
  }

  // Report pagination availability to extension components such as the popup.
  function handleStatusRequest(request, _sender, sendResponse) {
    if (request?.type !== 'CHECK_PAGE_STATUS') return false;

    const { previous, next } = getPaginationLinks();
    sendResponse({
      // Reaching this listener means the eligible-path guard already passed.
      isSupportedPage: true,
      hasPrev: Boolean(previous),
      hasNext: Boolean(next)
    });
    // The response is synchronous, so the message channel need not remain open.
    return false;
  }

  // Initialize settings and register the content script's long-lived listeners.
  loadSettings();
  chrome.storage.onChanged.addListener(handleSettingsChange);
  chrome.runtime.onMessage.addListener(handleStatusRequest);
  // Capture keydown early enough to suppress conflicting page shortcuts when used.
  document.addEventListener('keydown', handleKeyDown, true);
})();
