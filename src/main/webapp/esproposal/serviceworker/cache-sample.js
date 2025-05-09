/**
 * CacheAPIによるキャッシュ配置
 * 
 * 参考:
 * https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
 * https://developer.mozilla.org/ja/docs/Web/API/Cache
 */

const addToCache = async resources => {
    const openedCache = await caches.open("cache-sample-v1");
    return openedCache.addAll(resources);
};

// リソースがCacheStorageに保存されているとactivate及びinstallイベントは発生しない。
// ただしServiceWorkerに登録されるスクリプトやそれを参照するファイルが変更された場合，
// installイベントは発生する。

self.addEventListener("activate", event => {
    console.log("Cache sample is activated!");
    console.log(event);
});

self.addEventListener("install", async event => {
    console.log("Cache sample is installed!");
    // TODO: scopeを別のオブジェクトから取得したい。
    const scope = "/webcise/esproposal/serviceworker/";
    const cacheTargetUrls = [
        `${scope}images/red.png`
    ];
    event.waitUntil(await addToCache(cacheTargetUrls));
});
