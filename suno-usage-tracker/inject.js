// Runs inside the Suno page. Watches the site's own "billing/info" request,
// copies the usage numbers, and re-requests them after you generate a song.
(() => {
  if (window.__sunoUsageHooked) return;
  window.__sunoUsageHooked = true;

  const MATCH = '/billing/info';
  const origFetch = window.fetch;
  let saved = null; // { url, headers } of the site's own billing request
  let timers = [];

  function toPlain(h) {
    const o = {};
    try {
      if (!h) return o;
      if (typeof Headers !== 'undefined' && h instanceof Headers) h.forEach((v, k) => { o[k] = v; });
      else if (Array.isArray(h)) h.forEach(([k, v]) => { o[k] = v; });
      else Object.assign(o, h);
    } catch (e) {}
    return o;
  }

  function publish(data) {
    window.postMessage({ source: 'suno-usage', type: 'data', data }, '*');
  }

  async function headersForReplay() {
    const h = Object.assign({}, saved ? saved.headers : {});
    try {
      const token = await window.Clerk.session.getToken();
      if (token) {
        for (const k of Object.keys(h)) if (k.toLowerCase() === 'authorization') delete h[k];
        h['Authorization'] = 'Bearer ' + token;
      }
    } catch (e) {}
    return h;
  }

  async function refetch() {
    if (!saved) return;
    try {
      const r = await origFetch(saved.url, { headers: await headersForReplay(), credentials: 'include' });
      if (r.ok) publish(await r.json());
    } catch (e) {}
  }

  window.fetch = function (input, init) {
    const p = origFetch.apply(this, arguments);
    try {
      const url = typeof input === 'string' ? input : ((input && input.url) || String(input));
      if (url.includes(MATCH)) {
        const fromReq = (typeof Request !== 'undefined' && input instanceof Request) ? toPlain(input.headers) : {};
        saved = { url, headers: Object.assign(fromReq, toPlain(init && init.headers)) };
        p.then(r => r.clone().json()).then(publish).catch(() => {});
      } else if (/\/api\/generate/.test(url)) {
        timers.forEach(clearTimeout);
        timers = [setTimeout(refetch, 4000), setTimeout(refetch, 20000), setTimeout(refetch, 60000)];
      }
    } catch (e) {}
    return p;
  };

  window.addEventListener('message', (e) => {
    if (e.source === window && e.data && e.data.source === 'suno-usage-cmd' && e.data.type === 'refresh') refetch();
  });

  setInterval(refetch, 60000);
})();
