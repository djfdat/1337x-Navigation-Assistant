# 1337x Navigation Assistant

A lightweight, high-performance browser extension (Manifest V3) that adds keyboard navigation exclusively to category and subcategory listing pages on **1337x** (`https://1337x.to/cat/...` and `https://1337x.to/sub/...`).

---

## ⚡ Features

- ⬅️ **ArrowLeft (`←`)**: Instant navigation to the **Previous Page** via active page sibling detection.
- ➡️ **ArrowRight (`→`)**: Instant navigation to the **Next Page** via active page sibling detection.
- 🎯 **Scoped Exclusively to Listing Pages**: Only activates on `/cat/*` and `/sub/*` URLs. Completely inactive on individual torrent pages (`/torrent/*`), the homepage, or non-paginated pages (e.g. `/trending`).
- 🛡️ **Input Guard**: Automatically ignores navigation keys when typing in the search bar, comment box, or text inputs.
- 🎯 **Visual HUD Feedback**: Subtle dark glassmorphic on-screen pill confirming page transition.
- ⚙️ **Popup Settings**:
  - Master toggle (Enable / Disable).
  - HUD visual indicator toggle.
  - Optional alternative keybindings (`A` / `D` or `[` / `]`).
- 🌐 **Comprehensive Mirror Support**: Works on `1337x.to`, `1337x.st`, `1337x.ws`, `1337x.eu`, `1337x.se`, `1337x.is`, and `1337x.gd`.

---

## 🚀 Installation Guide

### Google Chrome / Brave / Edge / Chromium

1. Open your browser and navigate to the Extensions management page:
   - **Chrome**: `chrome://extensions`
   - **Brave**: `brave://extensions`
   - **Edge**: `edge://extensions`
2. Enable **Developer mode** (toggle switch in the top-right corner).
3. Click the **Load unpacked** button in the top-left corner.
4. Select this directory (`1337x Navigation Assistant`).
5. The extension is now installed and active!

---

## ⌨️ Shortcuts Reference

| Action | Primary Shortcut | Alternative Shortcut (Configurable) |
|---|---|---|
| **Previous Page** | `←` (Left Arrow) | `A` or `[` |
| **Next Page** | `→` (Right Arrow) | `D` or `]` |

---

## 📁 Project Structure

```
1337x Navigation Assistant/
├── manifest.json         # Manifest V3 configuration
├── content/
│   ├── content.js        # DOM pagination detector and key listener
│   └── content.css       # Navigation HUD toast styles
├── popup/
│   ├── popup.html        # Settings popup interface
│   ├── popup.css         # Modern dark-mode styling
│   └── popup.js          # Options controller & tab detector
├── icons/
│   ├── icon-16.png       # 16x16 toolbar icon
│   ├── icon-32.png       # 32x32 high-density toolbar icon
│   ├── icon-48.png       # 48x48 extensions manager icon
│   ├── icon-128.png      # 128x128 store & installation icon
│   └── logo.svg          # Scalable master logo artwork
├── CHROMEWEBSTORE.md     # Chrome Web Store metadata & declarations
└── README.md             # Documentation & installation guide
```

## Architecture

The extension keeps its boundaries intentionally small:

- `content/content.js` owns page eligibility, pagination discovery, keyboard intent, and HUD rendering. Chrome storage is accessed only through its settings adapter functions.
- `popup/popup.js` coordinates three separate concerns: persisted settings, active-tab messaging, and DOM rendering. UI handlers update state and roll back if persistence fails.

Comments document browser-specific behavior and fallback decisions; function and variable names carry routine implementation details.

## Validation

Run these dependency-free checks before loading the extension:

```sh
node --check content/content.js
node --check popup/popup.js
python3 -m json.tool manifest.json > /dev/null
```

---

## 🔒 Privacy & Permissions

- **`storage`**: Used solely to persist your local user preferences (toggles and key selections).
- **Zero Tracking**: 100% offline and client-side. No telemetry, analytics, or external requests.
