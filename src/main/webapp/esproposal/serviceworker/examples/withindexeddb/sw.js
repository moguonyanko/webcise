// TODO: ServiceWorkerでmoduleをimportする方法が不明。以下はエラーになる。
// import swutils from "./swutils.js";

class User {
    constructor( {name, age, userid}) {
        this.name = name;
        this.age = age;
        this.userid = userid;
    }

    toString() {
        return `${this.userid}:${this.name},${this.age} years old`;
    }
}

const sampleObjects = [
    {
        name: "foo",
        age: 24,
        userid: "A001"
    },
    {
        name: "bar",
        age: 39,
        userid: "A002"
    },
    {
        name: "baz",
        age: 19,
        userid: "B001"
    },
    {
        name: "foo",
        age: 59,
        userid: "C001"
    }
];

const openDB = ({dbName, version}) => {
    return new Promise((resolve, reject) => {
        const request = self.indexedDB.open(dbName, version);
        request.onsuccess = event => {
            resolve(event.target.result);
        };
        request.onerror = event => {
            reject(event);
        };
        request.onupgradeneeded = event => {
            const db = event.target.result;
            const storeName = "users";
            const store = db.createObjectStore(storeName, {keyPath: "userid"});
            store.createIndex("name", "name", {
                unique: false
            });
            store.transaction.oncomplete = event => {
                const st = db.transaction([storeName], "readwrite")
                    .objectStore(storeName);
                sampleObjects.forEach(obj => st.add(new User(obj)));
            };
        };
    });
};

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

const dumpDB = async ({dbName, version}) => {
    try {
        const db = await openDB({dbName, version});
        const store = db.transaction("users").objectStore("users");
        const index = store.index("name");
        index.openCursor().onsuccess = event => {
            const cursor = event.target.result;
            if (cursor) {
                console.log(`${cursor.key}:${cursor.value.toString()}`);
                cursor.continue();
            }
        };
    } catch(err) {
        console.error(err);
    }
};

const onInstall = ({caches, CACHE_KEY, cacheTargets}) => {
    return event => {
        console.info(`Installed: ${CACHE_KEY}`);
        event.waitUntil(caches.open(CACHE_KEY)
            .then(cache => cache.addAll(cacheTargets)));
    };
};

const onFetch = ({caches, isCacheTarget, dbInfo}) => {
    return event => {
        console.info(`Fetched client id: ${event.clientId}`);
        const request = event.request;
        event.respondWith(caches.match(request)
            .then(response => checkResponse({caches, request, response, isCacheTarget})));
        // TODO: なんらかの問題によりページ表示時のエラーを引き起こす。
        // IndexedDB自体の読み書きは行える。
//        event.respondWith(caches.match(request)
//            .then(response => checkResponse({caches, request, response, isCacheTarget}))
//            .then(() => dumpDB(dbInfo))
//            .catch(err => console.error(err)));
    };
};

const swutils = {
    onActivate, onInstall, onFetch
};

// setup

const CACHE_PREFIX = "sw-examples-withindexeddb";
const CONTEXT = "/webcise/";
const APP_BASE = `${CONTEXT}esproposal/serviceworker/examples/withindexeddb/`;
const VERSION = "1";
const CACHE_KEY = `${CACHE_PREFIX}-${VERSION}`;
const dbInfo = {
    dbName: `${CACHE_PREFIX}-sampledb`,
    version: 1
};

const cacheTargets = [
    APP_BASE,
    `${APP_BASE}index.html`,
    `${APP_BASE}main.js`,
    `${APP_BASE}yellowarrow.png`,
    //`${CONTEXT}esproposal/serviceworker/images/blue.png`,
    `${CONTEXT}esproposal/serviceworker/images/red.png`
];

const isCacheTarget = url => cacheTargets.indexOf(url) >= 0;

// 一度ServiceWorkerがunregisterされるまでは何度ServiceWorkerスクリプトに
// 変更を行ってもactivateイベントは発生しない。installイベントはServiceWorker
// スクリプトに変更を加えてページを読み込みし直すたびに発生する。
self.addEventListener("activate", swutils.onActivate({caches, CACHE_KEY, CACHE_PREFIX}));
self.addEventListener("install", swutils.onInstall({caches, CACHE_KEY, cacheTargets}));
self.addEventListener("fetch", swutils.onFetch({caches, isCacheTarget, dbInfo}));

self.addEventListener("unhandledrejection", err => console.error(err));