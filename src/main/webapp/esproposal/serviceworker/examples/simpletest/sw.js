const CACHE_PREFIX = "sw-examples-simpletest";
const CONTEXT = "/webcise/";
const APP_BASE = `${CONTEXT}esproposal/serviceworker/examples/simpletest/`;
const VERSION = "1";
const CACHE_KEY = `${CACHE_PREFIX}-${VERSION}`;

const cacheTargets = [
    APP_BASE,
    `${APP_BASE}index.html`,
    `${APP_BASE}main.js`,
    `${APP_BASE}sample.json`
];

const isCacheTarget = url => cacheTargets.indexOf(url) >= 0;

const checkResponse = ({request, response}) => {
    if (response) {
        console.log(`Fetched (from cache storage): ${request.url}`);
        return Promise.resolve(response);
    }

    const promise = fetch(request).then(response => {
        console.log(`Fetched (from server): ${request.url}`);
        if (isCacheTarget(request.url)) {
            return caches.open(getKey()).then(cache => {
                console.log(`Recovered cache: ${request.url}`);
                cache.put(request, response.clone());
                return response;
            });
        } else {
            console.log(`Not add to cache: ${request.url}`);
            return response;
        }
    });

    return promise;
};

self.addEventListener("activate", event => {
    console.log(`Activated: ${CACHE_KEY}`);
    event.waitUntil(caches.keys().then(keys => {
        return Promise.all(keys.map(key => {
            if (key.startsWith(CACHE_PREFIX) && key !== CACHE_KEY) {
                console.log(`Delete: ${key}`);
                return caches.delete(key);
            } else {
                return Promise.resolve(false);
            }
        }));
    }));
});

self.addEventListener("install", event => {
    console.log(`Installed: ${CACHE_KEY}`);
    event.waitUntil(caches.open(CACHE_KEY)
        .then(cache => cache.addAll(cacheTargets)));
});

self.addEventListener("fetch", event => {
    console.log(`Fetched client id: ${event.clientId}`);
    const request = event.request;
    event.respondWith(caches.match(request)
        .then(response => checkResponse({request, response})));
});
