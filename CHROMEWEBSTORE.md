# Chrome Web Store Listing — 1337x Navigation Assistant

> Last Updated: 2026-08-13

## Store Listing

**Extension Name** [REQUIRED]
1337x Navigation Assistant

**Short Description** [REQUIRED]
Effortlessly navigate category and subcategory listing pages on 1337x (/cat/ and /sub/) using ArrowLeft and ArrowRight keyboard shortcuts.

**Detailed Description** [REQUIRED]
1337x Navigation Assistant adds intuitive, lightning-fast keyboard navigation to 1337x category and subcategory pages.

Key Features:
- ArrowLeft (←) to instantly navigate to the previous page.
- ArrowRight (→) to navigate to the next page.
- Scoped to Paginated Pages: Only activates on `/cat/*` and `/sub/*` category listings; remains completely inactive on `/torrent/*` detail pages, the homepage, and non-paginated views.
- Active Sibling Detection: Accurately resolves previous and next pages using active item siblings, even when direct prev/next buttons are omitted.
- Input Guard Protection: Key presses are automatically ignored when typing in search bars or text fields.
- Visual HUD Indicator: Subtle, non-intrusive on-screen feedback confirming page navigation.
- Optional Alternative Shortcuts: Enable A / D or [ / ] keys from the settings popup.
- Broad Mirror Support: Works seamlessly on 1337x.to, 1337x.st, 1337x.ws, 1337x.eu, 1337x.se, 1337x.is, and 1337x.gd.

How to Use:
1. Open any category or subcategory page on 1337x (e.g., https://1337x.to/cat/... or https://1337x.to/sub/...).
2. Press the Right Arrow (→) to go to the next page, or the Left Arrow (←) to return to the previous page.
3. Click the extension toolbar icon at any time to toggle features or customize keybindings.

Privacy & Security:
This extension operates 100% locally in your browser. It does not collect, track, or transmit any user data or browsing history.

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Enables Left and Right arrow keyboard navigation across 1337x pagination listing and category pages.

**Primary Language** [REQUIRED]
English

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `icons/icon-128.png` |
| Small Icon | 48×48 PNG | ✅ Ready | `icons/icon-48.png` |
| Toolbar Icon | 16×16 PNG | ✅ Ready | `icons/icon-16.png` |

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Used exclusively to save and sync user preferences (extension toggle, HUD indicator toggle, and alternative keybindings). |
| `*://*.1337x.to/*` | host_permissions | Allows the content script to run on 1337x.to pages to detect pagination links and handle keyboard navigation. |
| `*://*.1337x.st/*` | host_permissions | Supports pagination keyboard navigation on the official 1337x.st mirror domain. |
| `*://*.1337x.ws/*` | host_permissions | Supports pagination keyboard navigation on the official 1337x.ws mirror domain. |
| `*://*.1337x.eu/*` | host_permissions | Supports pagination keyboard navigation on the official 1337x.eu mirror domain. |
| `*://*.1337x.se/*` | host_permissions | Supports pagination keyboard navigation on the official 1337x.se mirror domain. |
| `*://*.1337x.is/*` | host_permissions | Supports pagination keyboard navigation on the official 1337x.is mirror domain. |
| `*://*.1337x.gd/*` | host_permissions | Supports pagination keyboard navigation on the official 1337x.gd mirror domain. |

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Distribution

**Visibility**: Public
**Regions**: All regions
**Pricing**: Free

## Developer Info

**Publisher Name**: Antigravity Studio
**Support URL / Email**: https://github.com/

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-08-12 | Initial release with ArrowLeft / ArrowRight pagination support, input guard, HUD indicator, and options popup. | Ready |
