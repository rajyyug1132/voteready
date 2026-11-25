// VoteReady offline support: pages and data work without signal after one visit.
// Pages and JSON: network first (fresh when online), cache when offline.
// Everything else (CSS, JS, fonts, icons): cache first, refreshed in the background.
const VERSION = 'vr-v2';
const CORE = [
  './', 'index.html', 'checklist.html', 'booth.html', 'qa.html', 'map.html',
  'assets/site.css', 'assets/app.js', 'assets/logo.svg', 'assets/favicon.svg', 'translate.js',
  'data/checklist.json', 'data/checklist_hi.json', 'data/id_documents.json', 'data/myths.json', 'data/voters.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => Promise.allSettled(CORE.map((u) => c.add(u)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin && url.pathname.startsWith('/api/')) return; // live answers only
  const fresh = req.mode === 'navigate' || url.pathname.endsWith('.json') || url.pathname.endsWith('.html');

  if (fresh) {
    e.respondWith(fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match('index.html'))));
    return;
  }

  e.respondWith(caches.match(req).then((hit) => {
    const net = fetch(req).then((res) => {
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
