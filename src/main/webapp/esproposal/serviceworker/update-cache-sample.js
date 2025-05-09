/**
 * 参考:
 * https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
 */

const CACHE_PREFIX = "update-cache-sample-";

const CONTEXT = "/webcise/";

const APP_BASE = `${CONTEXT}esproposal/serviceworker/`;

const CACHE_BASE = `${APP_BASE}images/`;

const VERSION = "v3";

const getErrorPage = url => {
    const page = `
<html>
<head>
<meta charset="UTF-8" />
<title>Error Page</title>
</head>
<body>
<h1>Error Page</h1>
<h2>Error URL</h2>
<a href="${url}">${url}</a>
</body>
</html>
`;
    return Promise.resolve(page);
};

const COMMON_RESOURCES = [
    `${CONTEXT}gomakit.js`,
    `${CONTEXT}images/star.png`,
    APP_BASE,
    `${APP_BASE}index.html`,
    `${APP_BASE}main.css`,
    `${APP_BASE}main.js`
];

// v1とv2でキャッシュ対象リソースを変えることでキャッシュされるリソースと
// されないリソースを混在させ動作確認を行う。
const cacheTargets = {
    [`${CACHE_PREFIX}v1`]: COMMON_RESOURCES.concat([
        `${CACHE_BASE}green.png`,
        `${CACHE_BASE}orange.png`
    ]),
    [`${CACHE_PREFIX}v2`]: COMMON_RESOURCES.concat([
        `${CACHE_BASE}red.png`,
        `${CACHE_BASE}yellow.png`
    ]),
    [`${CACHE_PREFIX}v3`]: COMMON_RESOURCES.concat([
        `${CACHE_BASE}red.png`,
        `${CACHE_BASE}yellow.png`,
        `${CACHE_BASE}green.png`,
        `${CACHE_BASE}orange.png`
    ])
};

const getKey = () => `${CACHE_PREFIX}${VERSION}`;

const isCacheTargetResource = url => {
    return cacheTargets[getKey()].indexOf(url) >= 0;
};

const checkResponse = ({request, response}) => {
    if (response) {
        console.log(`Fetched (from cache storage): ${request.url}`);
        return Promise.resolve(response);
    }

    const promise = fetch(request).then(response => {
        console.log(`Fetched (from server): ${request.url}`);
        // 元々キャッシュ対象だったリソースのみFetch時にキャッシュへ追加する。
        if (isCacheTargetResource(request.url)) {
            return caches.open(getKey()).then(cache => {
                console.log(`Recoveroed cache: ${request.url}`);
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
    console.log(`Activated: ${getKey()}`);
    event.waitUntil(caches.keys().then(keys => {
        return Promise.all(keys.map(key => {
            if (key.startsWith(CACHE_PREFIX) && key !== getKey()) {
                console.log(`Delete: ${key}`);
                return caches.delete(key);
            } else {
                return Promise.resolve(false);
            }
        }));
    }));
});

let retryCount = 0;

const retryAddToCache = key => {
    return caches.open(`DUMMY-${key}`).then(cache => {
        console.log(`Retry adding to cache: ${++retryCount}`);
        return cache.add("./index.html")
                .then(async () => {
                    retryCount = 0;
                    await caches.delete(`DUMMY-${key}`);
                    return willAddToCache();
                })
                .catch(() => retryAddToCache(key));
    });
};

// TODO: Chrome向けに用意したCacheStorage追加関数なのだが
// FetchErrorを回避できていない。
const willAddToCache = () => {
    const key = getKey();
    return caches.open(key)
            .then(cache => cache.addAll(cacheTargets[key]))
            .catch(() => retryAddToCache());
};

// TODO: Chromeの場合，installイベントハンドラ内では一時的なキャッシュストレージに
// 対するリソースの追加もエラーになってしまう。
const initCache = async () => {
    const initKey = `update-cache-initializer`;
    try {
        const cache = await caches.open(initKey);
        // CacheStorageをopenするだけではFetchのエラーを回避できない。
        await cache.add("./");
        console.log(`Initialized: [${initKey}]`);
    } catch (err) {
        console.log(err.message);
    } finally {
        // エラー回避のためだけのCacheStorageなのでこれは削除する。
        await caches.delete(initKey);
        console.log(`Clean up: [${initKey}]`);
    }
};

self.addEventListener("install", event => {
    const key = getKey();
    console.log(`Install: ${key}`);
    const resources = cacheTargets[key];
    event.waitUntil(caches.open(key).then(cache => cache.addAll(resources)));
    //const cacheAdder = () => caches.open(key)
    //        .then(cache => cache.addAll(resources));
    //event.waitUntil(initCache().then(cacheAdder));
    //event.waitUntil(willAddToCache());
});

// CacheStorage保存対象でないリソースへのリクエスト時もfetchイベントが発生する。
// waitUntilやrespondWithの引数はPromiseでなければならないので，
// thenやcatchの関数の戻り値がPromiseでなければ意図した動作にならない場合がある。
self.addEventListener("fetch", event => {
    const request = event.request;
    // TODO: catchでデフォルトのレスポンスを返すのであれば，レスポンスのContent-Typeに
    // 合致した値を返すようにする。
    event.respondWith(caches.match(request)
            .then(response => checkResponse({request, response})));
});
