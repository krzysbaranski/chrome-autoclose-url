# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A Manifest V3 Chrome extension with no build step. All files are plain JavaScript — load directly via Chrome's "Load unpacked" feature.

## Architecture

There are three independent entry points:

- **`background.js`** — service worker (persistent background logic). Listens for `tabs.onUpdated`, matches URLs against rules stored in `chrome.storage.sync`, and schedules tab closes via `setTimeout`. Maintains a `pendingCloses` map (`tabId → timeoutId`) to cancel closes if the user navigates away.
- **`options.html/js/css`** — full-page options UI for CRUD on rules. Reads/writes `chrome.storage.sync` directly.
- **`popup.html/js`** — small toolbar popup; read-only summary + shortcut to open options.

### Rule schema (stored in `chrome.storage.sync`)

```js
{
  rules: [
    { pattern: "https://example.com/*", delay: 0, enabled: true }
  ]
}
```

`pattern` supports `*` wildcards and is matched against the full URL via a regex built in `matchesPattern()` in `background.js`.

## Loading the extension

1. `chrome://extensions` → enable Developer mode
2. **Load unpacked** → select this folder

After any edit to `background.js` or `manifest.json`, click the refresh icon on the extension card in `chrome://extensions`. Changes to `options.js`/`popup.js` take effect on next page open.
