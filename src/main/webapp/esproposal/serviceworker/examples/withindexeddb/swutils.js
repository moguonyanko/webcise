/**
 * ServiceWorkerでよく行われる処理をまとめたモジュールである。
 * しかしServiceWorkerでモジュールをimportすることができない。
 */

const checkResponse = ({caches, request, response, isCacheTarget}) => {
    if (response) {
        const time = new Date().toLocaleString();
        console.info(`Fetched (from cache storage): ${request.url} at ${time}`);
        return Promise.resolve(response);
    }

    const promise = fetch(request).then(response => {
        console.info(`Fetched (from server): ${request.url}`);
        if (isCacheTarget(request.url)) {
            return caches.open(getKey()).then(cache => {
                console.info(`Recovered cache: ${request.url}`);
                cache.put(request, response.clone());
                return response;
            });
        } else {
            console.info(`Not add to cache: ${request.url}`);
            return response;
        }
    });

    return promise;
};

const onActivate = ({caches, CACHE_KEY, CACHE_PREFIX}) => {
    return event => {
        console.info(`Activated: ${CACHE_KEY}`);
        event.waitUntil(caches.keys().then(keys => {
            return Promise.all(keys.map(key => {
                if (key.startsWith(CACHE_PREFIX) && key !== CACHE_KEY) {
                    console.info(`Delete: ${key}`);
                    return caches.delete(key);
                } else {
                    return Promise.resolve(false);
                }
            }));
        }));
    };
};

const onInstall = ({caches, CACHE_KEY, cacheTargets}) => {
    return event => {
        console.info(`Installed: ${CACHE_KEY}`);
        event.waitUntil(caches.open(CACHE_KEY)
            .then(cache => cache.addAll(cacheTargets)));
    };
};

const onFetch = ({caches, isCacheTarget}) => {
    return event => {
        console.info(`Fetched client id: ${event.clientId}`);
        const request = event.request;
        event.respondWith(caches.match(request)
            .then(response => checkResponse({caches, request, response, isCacheTarget})));
    };
};

const swutils = {
    onActivate, onInstall, onFetch
};

export default swutils;
