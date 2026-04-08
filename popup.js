chrome.storage.sync.get({ rules: [] }, (data) => {
  const enabled = data.rules.filter((r) => r.enabled !== false).length;
  const total = data.rules.length;
  document.getElementById('rule-count').textContent =
    total === 0
      ? 'No rules configured.'
      : `${enabled} of ${total} rule${total !== 1 ? 's' : ''} active.`;
});

document.getElementById('options-btn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});
