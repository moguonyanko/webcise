/**
 * Push API練習用ServiceWorkerスクリプト
 * 
 * 参考:
 * https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
 */

const VERSION = "v1.01";

const APP_NAME = "Push-API-Sample";

const CURRENT_CACHE_KEY = `${APP_NAME}-${VERSION}`;

const openCache = async () => {
    return await caches.open(CURRENT_CACHE_KEY);
};

/**
 * キャッシュに追加する時はクエリ文字列は考慮されない。
 * 何が付加されていてもマッチすれば追加される。例えば，
 * 「./index.html」をキャッシュ対象にした場合，「./index.html」も
 * 「./index.html?123」もキャッシュ追加対象になる。
 */
self.addEventListener("install", async event => {
    const cache = await openCache();
    event.waitUntil(cache.addAll([
        "./",
        "./index.html",
        "./main.js",
        "./main.css"
    ]));
});

self.addEventListener("fetch", event => {
    const request = event.request;
    // ignoreSearchがtrueだとクエリ文字列を無視してマッチを試みる。
    // 「./index?123」をリクエストしても「./index.html」がキャッシュから返される。
    const options = {
        ignoreSearch: false
    };
    event.respondWith(caches.match(request, options).then(response => {
        if (response) {
            console.log(`Fetch(from sw): ${request.url}`);
            return response;
        }
        return fetch(request).then(async response => {
            console.log(`Fetch(from server): ${request.url}`);
            return openCache().then(cache => {
                // Responseをcloneしていないとエラーになる。
                // ここまでに一度Responseのbodyが読まれているためである。
                cache.put(request, response.clone());
                return response;
            });
        });
    }));
});

self.addEventListener("activate", async event => {
    event.waitUntil(caches.keys().then(keys => {
        return Promise.all(keys.map(key => {
            if (key.startsWith(APP_NAME) && key !== CURRENT_CACHE_KEY) {
                console.log(`Delete cache: ${key}`);
                return caches.delete(key);
            } else {
                return Promise.resolve(false);
            }
        }));
    }));
});
