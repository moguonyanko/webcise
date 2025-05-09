/**
 * Web App Manifest動作検証用ServiceWorkerスクリプト
 * 
 * ServiceWorkerスクリプトを作成してそれをServiceWorkerに登録していないと，
 * 「no matching service worker detected」とコンソールに出力されエラーになる。
 * またfetchイベントのリスナーなどを定義してオフラインで動作する状態を作っていないと，
 * WebAppManifestからアプリケーションをホームスクリーンに追加できない。
 */

const APP_NAME = "web-app-menifest-sample";

const VERSION = "1";

const CACHE_KEY = `${APP_NAME}-${VERSION}`;

const RESOURCES = [
    "./",
    "./index.html",
    "./main.js",
    "./manifest.json"
];

self.addEventListener("activate", event => {
    event.waitUntil(caches.keys().then(keys => {
        return  Promise.all(keys.map(key => {
            if (key.startsWith(APP_NAME) && key !== CACHE_KEY) {
                return caches.delete(key);
            } else {
                return Promise.resolve(false);
            }
        }));
    }));
});

self.addEventListener("install", event => {
    event.waitUntil(caches.open(CACHE_KEY)
            .then(cache => cache.addAll(RESOURCES)));
});

self.addEventListener("fetch", event => {
    const request = event.request;
    event.respondWith(caches.match(request)
            .then(response => {
                if (response) {
                    return Promise.resolve(response);
                }
                return fetch(request).then(response => {
                    return caches.open(CACHE_KEY).then(cache => {
                        cache.put(request, response.clone());
                        return response;
                    });
                });
            }));
});
