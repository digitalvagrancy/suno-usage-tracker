// Passes the numbers from the page to the extension's storage.
window.addEventListener('message', (e) => {
  try {
    if (e.source !== window || !e.data || e.data.source !== 'suno-usage' || e.data.type !== 'data') return;
    const d = e.data.data;
    if (!d || typeof d.monthly_usage !== 'number' || typeof d.monthly_limit !== 'number') return;
    chrome.storage.local.set({
      suno: { usage: d.monthly_usage, limit: d.monthly_limit, credits: d.credits, time: Date.now() }
    });
  } catch (err) {}
});

chrome.runtime.onMessage.addListener((m) => {
  if (m && m.type === 'refresh') window.postMessage({ source: 'suno-usage-cmd', type: 'refresh' }, '*');
});
