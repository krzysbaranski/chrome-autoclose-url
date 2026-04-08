# Auto Close URLs

A Chrome extension that automatically closes tabs matching user-defined URL patterns, with an optional delay.

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the project folder.

## Usage

Click the extension icon in the toolbar to see how many rules are active, then click **Manage Rules** to open the options page.

### Adding a rule

| Field | Description |
|-------|-------------|
| **URL Pattern** | Full URL to match. Use `*` as a wildcard for any sequence of characters. |
| **Delay (ms)** | How long to wait after the page finishes loading before closing the tab. Default is `0` (close immediately). |

### Pattern examples

| Pattern | Matches |
|---------|---------|
| `https://example.com/*` | Any page under `https://example.com/` |
| `*://ads.example.com/*` | Any scheme on `ads.example.com` |
| `https://example.com/logout` | That exact URL only |
| `https://*.example.com/*` | Any subdomain of `example.com` |

### Managing rules

- **Checkbox** — enable or disable a rule without deleting it.
- **×** button — permanently delete a rule.

Rules are synced across devices via your Chrome profile (`chrome.storage.sync`).

## How it works

The background service worker listens for `tabs.onUpdated` events. When a tab finishes loading, its URL is checked against all enabled rules. If a match is found, the tab is scheduled for closing after the configured delay. Navigating away before the timer fires cancels the pending close.

## License

MIT
