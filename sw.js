/* OpenStudy service worker.
   The page is network-first so an update arrives as soon as it is published;
   everything else is cache-first so the app opens and studies offline. Bump
   CACHE to retire an old shell. */
const CACHE='openstudy-v1';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()).catch(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys()
    .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  if(req.mode==='navigate'){
    event.respondWith(
      fetch(req).then(res=>{
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put('./index.html',copy)).catch(()=>{});
        return res;
      }).catch(()=>caches.match('./index.html').then(hit=>hit||Response.error()))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then(hit=>{
      if(hit)return hit;
      return fetch(req).then(res=>{
        // Opaque CDN responses are cached too, so fonts and the PDF engine
        // survive going offline.
        if(res&&(res.ok||res.type==='opaque')){
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
        }
        return res;
      }).catch(()=>hit||Response.error());
    })
  );
});
