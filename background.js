// Map of tabId -> timeoutId for pending closes
const pendingCloses = new Map();

function getRules(callback) {
  chrome.storage.sync.get({ rules: [] }, (data) => callback(data.rules));
}

function matchesPattern(url, pattern) {
  // Support wildcards: * matches any sequence of characters
  try {
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`).test(url);
  } catch {
    return false;
  }
}

function scheduleClose(tabId, delayMs) {
  // Cancel any existing pending close for this tab
  if (pendingCloses.has(tabId)) {
    clearTimeout(pendingCloses.get(tabId));
  }

  const timeoutId = setTimeout(() => {
    pendingCloses.delete(tabId);
    chrome.tabs.remove(tabId, () => {
      if (chrome.runtime.lastError) {
        // Tab already closed or doesn't exist — ignore
      }
    });
  }, delayMs);

  pendingCloses.set(tabId, timeoutId);
}

function checkTab(tabId, url) {
  if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) return;

  getRules((rules) => {
    const enabledRules = rules.filter((r) => r.enabled !== false);
    for (const rule of enabledRules) {
      if (matchesPattern(url, rule.pattern)) {
        const delay = typeof rule.delay === 'number' ? rule.delay : 0;
        scheduleClose(tabId, delay);
        return;
      }
    }
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    checkTab(tabId, tab.url);
  }
});

// Cancel pending close if user navigates away from the matched URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url && pendingCloses.has(tabId)) {
    clearTimeout(pendingCloses.get(tabId));
    pendingCloses.delete(tabId);
    // Re-check the new URL
    checkTab(tabId, changeInfo.url);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (pendingCloses.has(tabId)) {
    clearTimeout(pendingCloses.get(tabId));
    pendingCloses.delete(tabId);
  }
});
