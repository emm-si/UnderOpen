const CACHE = 'underopen-v3';
const ASSETS = [
	  './',
	  './index.html',
	  './manifest.webmanifest',
	  './css/style.css',
	  './js/app.js',
	  './js/state.js',
	  './js/roles.js',
	  './js/packs.js',
	  './packs/fr.js',
	  './packs/en.js'
];

self.addEventListener('install', e => {
	  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
	  self.skipWaiting();
});

self.addEventListener('activate', e => {
	  e.waitUntil(caches.keys().then(keys =>
		      Promise.all(keys.map(k => k !== CACHE && caches.delete(k)))
		    ));
	  self.clients.claim();
});

self.addEventListener('fetch', e => {
	  e.respondWith(
		      caches.match(e.request).then(cached => {
			            if (cached) return cached;
			            return fetch(e.request).then(res => {
					            if (res && res.status === 200 && res.type === 'basic') {
							              caches.open(CACHE).then(c => c.put(e.request, res.clone()));
							            }
					            return res;
					          }).catch(() => {
							          if (e.request.mode === 'navigate') return caches.match('./index.html');
							        });
			          })
		    );
});

