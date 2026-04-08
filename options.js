function loadRules(callback) {
  chrome.storage.sync.get({ rules: [] }, (data) => callback(data.rules));
}

function saveRules(rules, callback) {
  chrome.storage.sync.set({ rules }, callback);
}

function showStatus(msg) {
  const el = document.getElementById('status');
  el.textContent = msg;
  setTimeout(() => { el.textContent = ''; }, 2000);
}

function renderRules(rules) {
  const list = document.getElementById('rules-list');
  list.innerHTML = '';

  if (rules.length === 0) {
    list.innerHTML = '<p class="empty-state">No rules yet. Add one below.</p>';
    return;
  }

  rules.forEach((rule, index) => {
    const item = document.createElement('div');
    item.className = 'rule-item' + (rule.enabled === false ? ' disabled' : '');

    // Toggle checkbox
    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.className = 'rule-toggle';
    toggle.checked = rule.enabled !== false;
    toggle.title = 'Enable / disable rule';
    toggle.addEventListener('change', () => {
      loadRules((rules) => {
        rules[index].enabled = toggle.checked;
        saveRules(rules, () => {
          showStatus('Rule updated.');
          renderRules(rules);
        });
      });
    });

    const pattern = document.createElement('span');
    pattern.className = 'rule-pattern';
    pattern.textContent = rule.pattern;

    const delay = document.createElement('span');
    delay.className = 'rule-delay';
    delay.textContent = rule.delay > 0 ? `${rule.delay} ms` : 'instant';

    const del = document.createElement('button');
    del.className = 'rule-delete';
    del.title = 'Delete rule';
    del.textContent = '×';
    del.addEventListener('click', () => {
      loadRules((rules) => {
        rules.splice(index, 1);
        saveRules(rules, () => {
          showStatus('Rule deleted.');
          renderRules(rules);
        });
      });
    });

    item.appendChild(toggle);
    item.appendChild(pattern);
    item.appendChild(delay);
    item.appendChild(del);
    list.appendChild(item);
  });
}

document.getElementById('add-btn').addEventListener('click', () => {
  const patternInput = document.getElementById('new-pattern');
  const delayInput = document.getElementById('new-delay');
  const errorEl = document.getElementById('add-error');

  const pattern = patternInput.value.trim();
  const delay = parseInt(delayInput.value, 10);

  errorEl.textContent = '';

  if (!pattern) {
    errorEl.textContent = 'Pattern is required.';
    return;
  }

  if (isNaN(delay) || delay < 0) {
    errorEl.textContent = 'Delay must be 0 or a positive number.';
    return;
  }

  loadRules((rules) => {
    rules.push({ pattern, delay, enabled: true });
    saveRules(rules, () => {
      patternInput.value = '';
      delayInput.value = '0';
      showStatus('Rule added.');
      renderRules(rules);
    });
  });
});

// Allow submitting with Enter in the pattern field
document.getElementById('new-pattern').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('add-btn').click();
});

// Initial render
loadRules(renderRules);
