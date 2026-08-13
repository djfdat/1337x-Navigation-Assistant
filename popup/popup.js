/** Popup application controller: coordinates settings, page status, and rendering. */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const SETTINGS_DEFAULTS = Object.freeze({
    enabled: true,
    showToast: true,
    enableAltKeys: false
  });
  const STATUS = Object.freeze({
    active: { label: 'Active on 1337x', className: 'status-active' },
    paused: { label: 'Paused', className: 'status-paused' },
    standby: { label: 'Standby', className: 'status-standby' }
  });
  const controls = Object.freeze({
    enabled: getRequiredElement('toggleEnabled'),
    showToast: getRequiredElement('toggleToast'),
    enableAltKeys: getRequiredElement('toggleAltKeys')
  });
  const statusBadge = getRequiredElement('statusBadge');
  const statusText = getRequiredElement('statusText');
  const versionTag = getRequiredElement('versionTag');

  let settings = { ...SETTINGS_DEFAULTS };
  let isSupportedPage = false;

  function getRequiredElement(id) {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Popup element #${id} is missing.`);
    return element;
  }

  // Chrome's callback API is wrapped here so application logic can use one
  // predictable async error path.
  function loadSettings() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(SETTINGS_DEFAULTS, (storedSettings) => {
        const error = chrome.runtime.lastError;
        if (error) reject(error);
        else resolve(storedSettings);
      });
    });
  }

  function saveSetting(key, value) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ [key]: value }, () => {
        const error = chrome.runtime.lastError;
        if (error) reject(error);
        else resolve();
      });
    });
  }

  function getActivePageStatus() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (chrome.runtime.lastError || !tab?.id) {
          resolve(null);
          return;
        }

        chrome.tabs.sendMessage(tab.id, { type: 'CHECK_PAGE_STATUS' }, (response) => {
          // A missing receiver is expected on tabs outside the supported sites.
          resolve(chrome.runtime.lastError ? null : response ?? null);
        });
      });
    });
  }

  function renderSettings() {
    for (const [key, control] of Object.entries(controls)) {
      control.checked = settings[key];
    }
  }

  function renderStatus() {
    let status = STATUS.standby;
    if (isSupportedPage) status = settings.enabled ? STATUS.active : STATUS.paused;

    statusBadge.className = `status-badge ${status.className}`;
    statusText.textContent = status.label;
  }

  function bindSetting(key, control) {
    control.addEventListener('change', async () => {
      const previousValue = settings[key];
      settings[key] = control.checked;
      renderStatus();

      try {
        await saveSetting(key, settings[key]);
      } catch (error) {
        settings[key] = previousValue;
        renderSettings();
        renderStatus();
        console.error(`[1337x Navigation Assistant] Could not save ${key}.`, error);
      }
    });
  }

  async function initializePopup() {
    versionTag.textContent = `v${chrome.runtime.getManifest().version}`;

    const [storedSettings, pageStatus] = await Promise.all([
      loadSettings().catch((error) => {
        console.error('[1337x Navigation Assistant] Could not load settings.', error);
        return SETTINGS_DEFAULTS;
      }),
      getActivePageStatus()
    ]);

    settings = { ...SETTINGS_DEFAULTS, ...storedSettings };
    isSupportedPage = Boolean(pageStatus?.isSupportedPage);
    renderSettings();
    renderStatus();

    for (const [key, control] of Object.entries(controls)) bindSetting(key, control);
  }

  initializePopup().catch((error) => {
    console.error('[1337x Navigation Assistant] Popup initialization failed.', error);
  });
});
