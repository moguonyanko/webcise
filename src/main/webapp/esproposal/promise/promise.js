((window, document) => {
    "use strict";

    const samples = {
        finallyOfPromise() {
            const base = document.querySelector(".finally-of-promise"),
                    output = base.querySelector(".output"),
                    run = base.querySelector(".run"),
                    clear = base.querySelector(".clear"),
                    keywords = base.querySelectorAll(".keyword");

            const display = txt => output.innerHTML += txt + "<br />";

            const writePromiseLog = value => {
                console.log(value);
                display(value);
            };

            const makePromise = keyword => {
                return new Promise((resolve, reject) => {
                    if (keyword === "OK") {
                        resolve("resolved!");
                    } else if (keyword === "NG") {
                        reject(new Error("rejected!"));
                    } else {
                        throw new Error(`Unsupported keyword:${keyword}`);
                    }
                });
            };

            const doPromise = keyword => {
                const promise = makePromise(keyword);
                promise.then(value => {
                    writePromiseLog(value);
                }).catch(error => {
                    writePromiseLog(error);
                }).finally(() => {
                    // finallyメソッドの引数には何も渡されてこない。
                    // finallyメソッドをサポートしていない場合，finallyメソッドの処理は
                    // 無視される。シンタックスエラーにはならない。(iOS10のSafariの場合)
                    display("Finally");
                });
            };

            run.addEventListener("click", () => {
                const element = Array.from(keywords).filter(e => e.checked)[0];
                if (element) {
                    doPromise(element.value);
                } else {
                    display("no keyword");
                }
            });

            clear.addEventListener("click", () => {
                output.innerHTML = "";
            });
        },
        asyncFunctionWithPromise() {
            const base = document.querySelector(".async-function-with-promise"),
                    output = base.querySelector(".output"),
                    run = base.querySelector(".run"),
                    clear = base.querySelector(".clear"),
                    targetFileName = base.querySelector(".target-file-name");

            const loadSample = url => {
                // Promiseを返す関数をasync/awaitとともに使用する場合，返された
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open("GET", url);
                    xhr.onload = event => {
                        resolve(xhr.response);
                    };
                    // URLが誤っていてもonerrorハンドラは実行されない。
                    xhr.onerror = err => {
                        reject(new Error(`${xhr.status}:${xhr.statusText}`));
                    };
                    xhr.send(null);
                });
            };

            const doLoad = async () => {
                const url = targetFileName.value;
                try {
                    // Responseオブジェクトが返されるのはfetchを使った場合である。
                    // つまりXMLHttpRequestをPromiseでラップしてasync function化した場合は
                    // Response.okの値に従って例外をスローしたりはできない。
                    // 例えばURLが誤っていた場合はサーバのエラーページが文字列として
                    // そのまま返されてしまう。XMLHttpRequestを使用している古いコードを
                    // 変更することができないなどの理由が無い限り，HTTPリクエストを行う際は
                    // 常にfetchを使用するべきである。
                    const sample = await loadSample(url);
                    //const sample = loadSample(url);
                    // awaitしないことで得られたPromiseに対して呼び出したfinallyメソッドは
                    // 正常に実行される。しかしその後そのPromiseから結果を得ることはできない。
                    // async/awaitとPromiseのメソッドは組み合わせて使うものではないの
                    // かもしれない。 
                    //sample.finally(() => {
                    //    output.innerHTML += "Finally<br />";
                    //});
                    //await Promise.resolve(sample); // sampleは空のオブジェクトになる。
                    if (sample) {
                        output.innerHTML += JSON.stringify(sample) + "<br />";
                    } else {
                        output.innerHTML += "Sample is nothing" + "<br />";
                    }
                // Optional catch binding
                // ブラウザが対応していない場合エラーになる。
                //} catch { 
                //    output.innerHTML += "Loading error" + "<br />";
                //}
                } catch(err) {
                    output.innerHTML += "Loading error" + "<br />";
                }
            };

            run.addEventListener("click", doLoad);
            
            clear.addEventListener("click", () => output.innerHTML = "");
        }
    };

    const init = () => {
        Object.keys(samples).forEach(key => samples[key]());
    };

    window.addEventListener("DOMContentLoaded", init);
})(window, document);


