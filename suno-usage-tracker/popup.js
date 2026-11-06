const COST = 10; // credits per generation (2 songs)

function render(s) {
  const main = document.getElementById('main');
  const left = document.getElementById('left');
  const meta = document.getElementById('meta');
  if (!s) { main.textContent = '–'; left.textContent = 'Open suno.com once to load'; meta.textContent = ''; return; }
  const allowance = Math.max(0, s.limit - s.usage);
  const extra = Math.max(0, Number(s.credits) || 0);
  const gens = Math.floor((allowance + extra) / COST);
  main.textContent = s.usage + '/' + s.limit + ' used today';
  left.textContent = allowance + ' left today + ' + extra + ' backup = ' + gens + ' generation' + (gens === 1 ? '' : 's') + ' left';
  const mins = Math.round((Date.now() - s.time) / 60000);
  meta.textContent = 'Updated ' + (mins < 1 ? 'just now' : mins + ' min ago');
}

function resetText() {
  // Suno's free daily allowance resets at midnight UTC.
  const now = new Date();
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  const mins = Math.max(1, Math.ceil((next - now.getTime()) / 60000));
  return 'Resets in ~' + (mins >= 60 ? Math.round(mins / 60) + ' h' : mins + ' min');
}

function showReset() { document.getElementById('reset').textContent = resetText(); }
showReset();
setInterval(showReset, 30000);

function load() { chrome.storage.local.get('suno', (r) => render(r.suno)); }
load();
chrome.storage.onChanged.addListener(load);

document.getElementById('refresh').addEventListener('click', () => {
  chrome.tabs.query({ url: ['https://suno.com/*', 'https://*.suno.com/*'] }, (tabs) => {
    tabs.forEach((t) => chrome.tabs.sendMessage(t.id, { type: 'refresh' }, () => void chrome.runtime.lastError));
  });
  setTimeout(load, 1500);
});
