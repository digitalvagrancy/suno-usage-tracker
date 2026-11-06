const COST = 10; // credits per generation (2 songs)

function setBadge(s) {
  if (!s) return;
  const total = Math.max(0, s.limit - s.usage) + Math.max(0, Number(s.credits) || 0);
  const left = Math.floor(total / COST);
  chrome.action.setBadgeText({ text: String(left) });
  chrome.action.setBadgeBackgroundColor({ color: left === 0 ? '#c0392b' : '#2e7d32' });
}

chrome.storage.onChanged.addListener((c) => { if (c.suno) setBadge(c.suno.newValue); });
chrome.runtime.onStartup.addListener(() => chrome.storage.local.get('suno', (r) => setBadge(r.suno)));
chrome.runtime.onInstalled.addListener(() => chrome.storage.local.get('suno', (r) => setBadge(r.suno)));
