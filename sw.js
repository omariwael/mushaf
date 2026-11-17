const SHELL='mushaf-shell-v2',DATA='mushaf-data-v2',AUD='mushaf-audio-v1';
const CORE=['./','index.html','manifest.webmanifest','d/meta.json','d/pages.json','f/amiri.woff2','f/naskh.woff2','f/naskh-b.woff2','f/ui.woff2','f/ui-m.woff2','f/ui-l.woff2','f/bsml.woff2','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(SHELL).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>![SHELL,DATA,AUD].includes(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
async function audio(req){const c=await caches.open(AUD),hit=await c.match(req.url);if(!hit)return fetch(req);
 const range=req.headers.get('range');if(!range||hit.type==='opaque')return hit;
 const buf=await hit.arrayBuffer(),m=/bytes=(\d*)-(\d*)/.exec(range),len=buf.byteLength;
 const st=m&&m[1]?+m[1]:0,en=m&&m[2]?Math.min(+m[2],len-1):len-1;
 return new Response(buf.slice(st,en+1),{status:206,headers:{'Content-Type':'audio/mpeg','Content-Range':`bytes ${st}-${en}/${len}`,'Content-Length':String(en-st+1),'Accept-Ranges':'bytes'}})}
async function netFirst(req){const c=await caches.open(SHELL);try{const r=await fetch(req);if(r.ok)c.put(req,r.clone());return r}
 catch(e){return (await c.match(req,{ignoreSearch:true}))||(await c.match('index.html'))}}
async function cacheFirst(req,u){const hit=await caches.match(req,{ignoreSearch:true});if(hit)return hit;
 const r=await fetch(req);if(r.ok&&/\/(f|d)\//.test(u.pathname)){const c=await caches.open(/\/d\/(meta|pages)/.test(u.pathname)?SHELL:DATA);c.put(req,r.clone())}return r}
self.addEventListener('fetch',e=>{const req=e.request,u=new URL(req.url);if(req.method!=='GET')return;
 if(u.hostname==='everyayah.com'){e.respondWith(audio(req));return}
 if(u.origin!==location.origin)return;
 if(req.mode==='navigate'||/(index\.html|sw\.js|manifest\.webmanifest|meta\.json|pages\.json)$/.test(u.pathname)||u.pathname.endsWith('/')){e.respondWith(netFirst(req));return}
 e.respondWith(cacheFirst(req,u))});
