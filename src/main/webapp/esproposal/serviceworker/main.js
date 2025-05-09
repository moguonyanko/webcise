((win, doc, nav, g) => {
    "use strict";

    const q = (selector, base) => {
        return (base || doc).querySelector(selector);
    };

    const qa = (selector, base) => {
        return (base || doc).querySelectorAll(selector);
    };

    const pr = (target, content) => {
        target.innerHTML += content + "<br />";
    };

    const cl = target => target.innerHTML = "";

    const sw = nav.serviceWorker;

    const enableSW = () => {
        return "serviceWorker" in nav;
    };
    
    /**
     * デフォルトはこのディレクトリのみをスコープとする。
     * 自己証明書を用いたHTTPSで通信している場合，Chromeでは
     * セキュリティエラーになってしまう。
     * Chromeの起動オプションを変更することで対応できる。
     */
    const register = async ({url, scope}) => {
        const registration = await sw.register(url, {scope});
        return registration;
    };

    const getCacheKeys = async pattern => {
        if (pattern) {
            const regex = new RegExp(pattern);
            return (await caches.keys()).filter(key => regex.test(key));
        } else {
            return await caches.keys();
        }
    };
    
    const hasCacheKey = async keyName => {
        const keys = await getCacheKeys(keyName);
        return keys.length > 0;
    };

    const getCacheKeyString = async (pattern, separator = ",") => {
        return (await getCacheKeys(pattern)).join(separator);
    };

    const targets = {
        registerSample(g) {
            const base = ".register-sample ";

            const regEle = doc.querySelector(base + ".register-service-worker"),
                    clearEle = doc.querySelector(base + ".clear-result"),
                    output = doc.querySelector(base + ".result-area");

            const checkReady = () => {
                sw.ready.then(registration => g.println(output, `Ready: ${JSON.stringify(registration)}`))
                        .catch(err => g.println(output, `Ready failed: ${err.message}`));
                // Promise.prototype.finallyは未対応ブラウザが多い。
                //.finally(() => g.println(output, "Ready!"));
            };

            const regFunc = async () => {
                if (!enableSW()) {
                    g.println(output, "Cannot use Service Worker");
                    return;
                }

                try {
                    // このディレクトリのみをスコープとする。
                    const scope = "./";
                    // 自己証明書を用いたHTTPSで通信している場合，
                    // Chromeではセキュリティエラーになってしまう。
                    // Chromeの起動オプションを変更することで対応できる。
                    const registration = await sw.register("register-sample.js", {scope});
                    console.log(registration);
                    const active = registration.active;
                    g.println(output, `${active.scriptURL} : ${active.state}`);
                } catch (err) {
                    g.println(output, err.message);
                } finally {
                    checkReady();
                }
            };

            regEle.addEventListener("click", regFunc);
            clearEle.addEventListener("click", () => g.clear(output));
        },
        cacheSample() {
            if (!enableSW()) {
                return;
            }

            const base = document.querySelector(".cache-sample");
            const resultArea = base.querySelector(".result-area");

            base.querySelector(".register").addEventListener("click", async () => {
                const scope = "/webcise/esproposal/serviceworker/";
                const reg = await register({
                    url: "cache-sample.js", scope
                });
                resultArea.innerHTML += JSON.stringify(reg) + "<br />";
                resultArea.innerHTML += (await getCacheKeys()).join(",") + "<br />";
            });

            base.querySelector(".clear").addEventListener("click", () => {
                resultArea.innerHTML = "";
            });
        },
        customResponseSample() {
            const base = q(".custom-response-sample"),
                    resultArea = q(".result-area", base),
                    resultImage = q(".result-image", base),
                    adder = q(".adder", base),
                    getter = q(".getter", base),
                    clearer = q(".clearer", base);

            getter.addEventListener("click", () => {
                const url = "./images/blue.png";
                const img = doc.createElement("img");
                img.onload = () => resultImage.appendChild(img);
                img.src = url;
            });

            clearer.addEventListener("click", () => {
                cl(resultArea);
                cl(resultImage);
            });

            if (!enableSW()) {
                return;
            }

            adder.addEventListener("click", async () => {
                // ここでコンテキストルートをスコープにするにはServiceWorkerスクリプトを
                // 移動するかService-Worker-Allowedヘッダーを使用しなければならない。
                const scope = "/webcise/";
                //const scope = "/webcise/esproposal/serviceworker/";
                const registration = await register({
                    url: "custom-response-sample.js", scope
                });
                const keyStr = await getCacheKeyString("custom-response-sample");
                console.log(keyStr);
                pr(resultArea, keyStr);
            });
        },
        updateCacheSample() {
            if (!enableSW()) {
                return;
            }
            
            const SAMPLE_ID = "update-cache-sample";
            
            const base = q(`.${SAMPLE_ID}`),
                    loader = q(".loader", base),
                    unregister = q(".unregister", base),
                    cacheInitializer = q(".cache-initializer", base),
                    versionNumber = q(".version-number", base),
                    keyChecker = q(".keychecker", base),
                    appender = q(".appender", base),
                    clearer = q(".clearer", base),
                    resultArea = q(".result-area", base),
                    resultImage = q(".result-image", base);

            const p = txt => pr(resultArea, txt);

            const printKeyInfo = async () => {
                const keyStr = await getCacheKeyString("update-cache-sample");
                const info = `キー[${keyStr}]のキャッシュが登録済みです。`;
                p(info);
            };
            
            loader.addEventListener("click", async () => {
                const url = `update-cache-sample.js`;
                await sw.register(url);
                await printKeyInfo();
            });
            
            // ServiceWorkerをunregisterするとCacheStorageにリソースが残っていても
            // 使われず，ブラウザキャッシュが使われたりサーバへリクエストされたりする。
            // fetchイベントを処理するServiceWorkerスクリプトがunregisterされるのだから
            // 当然の動作ではある。
            unregister.addEventListener("click", async () => {
                try {
                    // readyプロパティを介して登録済みServiceWorkerRegistrationを
                    // 取得することができる。
                    const registration = await sw.ready;
                    const result = await registration.unregister();
                    p(`Succeed in unregister: ${result}`);
                } catch (err) {
                    p(`Error unregister: ${err.message}`);
                }
            });
            
            // Chromeでは前もってCacheStorageをopenしてキャッシュに適当なリソースを
            // 追加しておかないと，ServiceWorkerスクリプトのinstallイベントハンドラで
            // キャッシュ対象リソースの追加が行えない。「Failed to fetch」となる。
            // これと同じ初期化処理をServiceWorkerスクリプトのinstallイベントハンドラで
            // 行ってもエラーになる。
            cacheInitializer.addEventListener("click", async () => {
                const initKey = `${SAMPLE_ID}-cache-initializer`;
                try {
                    const cache = await caches.open(initKey);
                    // CacheStorageをopenするだけではFetchのエラーを回避できない。
                    await cache.add("./");
                    p(`Initialized: [${initKey}]`);
                } catch(err) {
                    p(err.message);
                } finally {
                    // エラー回避のためだけのCacheStorageなのでこれは削除する。
                    await caches.delete(initKey);
                    p(`Clean up: [${initKey}]`);
                }
                
                // Promise.prototype.finallyはほとんどのブラウザで未実装。
                //caches.open(initKey)
                //        .then(cache => cache.add("./"))
                //        .catch(err => p(err.message))
                //        .finally(() => caches.delete(initKey));
            });
            
            // 以下のコードではキャッシュキーを指定する記述を行なっているが，本来は
            // キャッシュキーを指定するようなコードをServiceWorkerスクリプト以外で
            // 書くべきではない。というかキャッシュのバージョンやキーを外部スクリプトに
            // 意識させるべきではない。それらはServiceWorkerスクリプト内だけで参照するべきである。
            keyChecker.addEventListener("click", async () => {
                const version = versionNumber.value;
                const keyName = `update-cache-sample-v${version}`;
                const result = await hasCacheKey(keyName);
                p(`Cache storage [${keyName}] is ${result ? "used" : "not used"}`);
            });

            // ServiceWorkerスクリプトを登録している側のスクリプトはCacheStorageに
            // キャッシュされている可能性があるので，CacheStorageのバージョンを明示的に
            // 参照したりしないようにする。バージョンの齟齬が発生しそうだし二重管理にもなる。

            const imageUrls = [
                "images/red.png",
                "images/yellow.png",
                "images/green.png",
                "images/orange.png"
            ];

            class ImageError extends Error {
                constructor( {message, img}) {
                    super(message);
                    // superによるコンストラクタ呼び出しが無い状態でmessageプロパティを
                    // 参照すると，初期化されていないプロパティを参照したとしてエラーになる。
                    // this.message = message;
                    this.img = img;
                }
            }

            const getImages = () => {
                const allPromise = Promise.all(imageUrls.map(url => {
                    return new Promise((resolve, reject) => {
                        const img = doc.createElement("img");
                        img.onload = event => {
                            resolve(img);
                        };
                        img.onerror = err => {
                            const message = `Failed fetch: ${url}. Reason: ${err.message}`;
                            reject(new ImageError({message, img}));
                        };
                        img.src = url;
                    });
                }));
                return allPromise;
            };

            appender.addEventListener("click", async () => {
                try {
                    const imageContainer = doc.createDocumentFragment();
                    const imgs = await getImages();
                    imgs.forEach(img => imageContainer.appendChild(img));
                    resultImage.appendChild(imageContainer);
                    p("All images are appended");
                } catch (err) {
                    p(`ERROR: ${err.message}`);
                }
            });

            clearer.addEventListener("click", () => {
                resultArea.innerHTML = "";
                resultImage.innerHTML = "";
            });
        }
    };

    const init = () => Object.values(targets).forEach(t => t(g));

    win.addEventListener("DOMContentLoaded", init);
})(window, document, navigator, goma);
