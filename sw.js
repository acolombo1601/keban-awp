let cacheName = "cache";
let cacheDynamic = "cache2";

self.addEventListener('install', (e) => {
    console.log('instalado', e);
    e.waitUntil(
        caches.open(cacheDynamic)
            .then((cache)=>{
                cache.addAll(
                    ['index.html', 'style.css', 'img/keban-logo.svg']
                );
            })
    )
});


self.addEventListener('activate', (e) => {
    console.log('activo', e)
});

self.addEventListener('fetch', (e)=>{
    e.respondWith(
        caches.match(e.request)
            .then((response)=>{
                if(response){
                    return response;
                }

                let requestToCache=e.request.clone();
                return fetch(requestToCache)
                    .then(
                        function (response){
                            if(!response || response.status !== 200){
                                return response;
                            }

                            let responseToCache = response.clone()
                            caches.open(cacheDynamic)
                                .then((cache)=>{
                                    cache.put(requestToCache, responseToCache)
                                })
                                return response;
                        }
                    )

                //return fetch(e.request)
            })
    )
})