const filesToCache = [
    "/", "/index.html","index.js", "/db.js", "/style.css"];

const cache_name = "static-cache-";
const cached_data_name = "data-cache";

self.addEventListener("install", function(evt) {
  evt.waitUntil(
    caches.open(cache_name).then(cache => {
      return cache.addAll(filesToCache);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", function(evt) {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== cache_name && key !== cached_data_name) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", evt => {
    if(evt.request.url.includes('/api/')) {
    
evt.respondWith(
                caches.open(cached_data_name).then(cache => {
                return fetch(evt.request)
                .then(response => {
                    if (response.status === 200){
                        cache.put(evt.request.url, response.clone());
                    }
                    return response;
                })
                .catch(err => {
                    return cache.match(evt.request);
                });
            })
            );
            return;
        }

evt.respondWith(
    caches.open(cache_name).then( cache => {
      return cache.match(evt.request).then(response => {
        return response || fetch(evt.request);
      });
    })
  );
});
