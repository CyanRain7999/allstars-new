/* Relative URLs and a cache per scope support both / and /repository/. */
importScripts('./precache-manifest.js');
const PREFIX='allstars-'+encodeURIComponent(self.registration.scope)+'-',CACHE=PREFIX+self.ALLSTARS_PRECACHE.version;
const FILES=self.ALLSTARS_PRECACHE.files.map(f=>new URL(f,self.registration.scope).href),SHELL=new URL('index.html',self.registration.scope).href;
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);try{await cache.addAll(FILES);}catch(error){await caches.delete(CACHE);throw error;}})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;const url=new URL(event.request.url),scope=new URL(self.registration.scope);
  if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
  const isShell=event.request.mode==='navigate'&&(url.pathname===scope.pathname||url.pathname===new URL(SHELL).pathname);
  const clean=url.origin+url.pathname;if(!isShell&&!FILES.includes(clean))return;
  event.respondWith((async()=>{const cache=await caches.open(CACHE),cached=await cache.match(isShell?SHELL:clean);if(cached)return cached;return fetch(event.request);})());
});
self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
  if(event.data?.type==='CACHE_STATUS')event.waitUntil((async()=>{const cache=await caches.open(CACHE),all=await Promise.all(FILES.map(url=>cache.match(url)));event.ports[0]?.postMessage({ready:all.every(Boolean),count:all.filter(Boolean).length,total:FILES.length,version:self.ALLSTARS_PRECACHE.version});})());
});
