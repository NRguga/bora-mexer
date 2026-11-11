// Bora Mexer! service worker: funciona offline (inclui as fotos) e atualiza-se sozinho.
const CACHE='boramexer-v4';
const SHELL=["./", "./index.html", "./manifest.json", "./icons/icon-192.png", "./icons/apple-touch-icon.png", "./img/agachamento-0.jpg", "./img/agachamento-1.jpg", "./img/calcanhar-rabo-0.jpg", "./img/calcanhar-rabo-1.jpg", "./img/curl-0.jpg", "./img/curl-1.jpg", "./img/elevacao-pelvica-0.jpg", "./img/elevacao-pelvica-1.jpg", "./img/escadas-0.jpg", "./img/escadas-1.jpg", "./img/flexoes-0.jpg", "./img/flexoes-1.jpg", "./img/joelho-chao-0.jpg", "./img/joelho-chao-1.jpg", "./img/joelho-peito-0.jpg", "./img/press-ombros-0.jpg", "./img/press-ombros-1.jpg", "./img/remada-0.jpg", "./img/remada-1.jpg", "./img/triceps-0.jpg", "./img/triceps-1.jpg"];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
// Página: tenta sempre a versão mais recente (rede) e só usa a cópia guardada se não houver internet.
// Imagens e ícones: cópia guardada primeiro, atualizada em segundo plano.
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  const isPage=req.mode==='navigate'||/\/(index\.html)?$/.test(new URL(req.url).pathname)||req.url.endsWith('.json');
  e.respondWith(caches.open(CACHE).then(async cache=>{
    if(isPage){
      try{const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),4000);
        const res=await fetch(req,{cache:'no-store',signal:ctl.signal});clearTimeout(t);
        if(res&&res.ok){cache.put(req,res.clone());return res;}}catch(err){}
      return (await cache.match(req,{ignoreSearch:true}))||(await cache.match('./index.html'))||(await cache.match('./'));
    }
    const cached=await cache.match(req,{ignoreSearch:true});
    const net=fetch(req).then(r=>{if(r&&r.ok)cache.put(req,r.clone());return r;}).catch(()=>null);
    return cached||(await net);
  }));
});
