/**
 * 参考:
 * https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
 * https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil
 */

const CACHE_VERSION = "custom-response-sample-v2";

const addToCache = async () => {
    const cache = await caches.open(CACHE_VERSION);
    return cache.addAll([
        "/webcise/gomakit.js", // スコープがコンテキストルートでないとキャッシュできない。
        "/webcise/images/star.png",
        "/webcise/esproposal/serviceworker/",
        "/webcise/esproposal/serviceworker/index.html",
        "/webcise/esproposal/serviceworker/main.css",
        "/webcise/esproposal/serviceworker/main.js",
        //"/webcise/esproposal/serviceworker/images/", // Cacheに保存されない。エラーになっている？
        "/webcise/esproposal/serviceworker/images/blue.png"
    ]);
};

self.addEventListener("install", async event => {
    console.log("Custom response sample installed");
    event.waitUntil(await addToCache());
});

/**
 * Cacheにマッチするリクエストが存在しなかった時，そのリクエストを用いて
 * サーバにリクエストを行いレスポンスを得る。得られたレスポンスはCacheに
 * 保存しておく。
 */
const recoveryRequest = async request => {
    console.log("Recovery request");
    const response = await fetch(request);
    const cache = await caches.open(CACHE_VERSION);
    cache.put(request, response.clone());
    return response;
};

self.addEventListener("fetch", async event => {
    console.log(`Fetched!: ${event.request.url}`);
    event.respondWith(caches.match(event.request)
            .catch(() => recoveryRequest(event.request)));
});
