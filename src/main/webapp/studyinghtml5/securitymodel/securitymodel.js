((win, doc, loc, math, nav) => {
    "use strict";

    // ECMAScriptで完結しているコードとそうでないコードは分離する。

    // Reference: MDN Math.random()
    const getRandomValue = ({ min, max }) => {
        const r = math.random() * (max - min + 1) + min;
        return math.floor(r);
    };

    const getRandomValues = ({ size, min, max }) => {
        const values = [];
        for (let i = 0; i < size; i++) {
            values.push(getRandomValue({min, max}));
        }
        return values;
    };

    // DOM utility

    const getSelectedElementValue = ({base, selector}) => {
        const eles = Array.from(base.querySelectorAll(selector))
                .filter(ele => ele.checked);
        return eles[0] ? eles[0].value : null;
    };

    const accessControlAllowOrigin = () => {
        const base = doc.getElementById("access-control-allow-origin-sample");
        const result = base.querySelector(".result");

        const createWorker = ({ host, workerFileName, onmessage }) => {
            const urls = [
                loc.protocol + "//",
                host,
                loc.pathname,
                workerFileName
            ];
            const worker = new Worker(urls.join(""));
            worker.onmessage = evt => {
                const res = evt.data.result;
                onmessage(res);
            };
            return worker;
        };

        const getHost = () => {
            const hostEles = doc.getElementsByName("select-host");
            return Array.from(hostEles).filter(ele => ele.checked)[0].value;
        };

        const getAddingArgs = () => {
            const size = parseInt(base.querySelector(".adding-values-size").value);
            const min = parseInt(base.querySelector(".adding-values-min").value);
            const max = parseInt(base.querySelector(".adding-values-max").value);
            return {size, min, max};
        };

        const println = txt => result.innerHTML += txt + "<br />";

        base.querySelector(".run").addEventListener("click", () => {
            const host = getHost();
            const workerFileName = "calcworker.js";
            const onmessage = resultValue => println(resultValue);
            try {
                const worker = createWorker({host, workerFileName, onmessage});
                const values = getRandomValues(getAddingArgs());
                println(`adding:${values}`);
                worker.postMessage({values});
            } catch (err) {
                println(err.message);
            }
        });

        base.querySelector(".clear").addEventListener("click", () => {
            result.innerHTML = "";
        });
    };

    const preflightRequest = () => {
        const calculation = {
            async post( { values = [], url, useCustomHeader = false } = {}) {
                if (values.length <= 0 || !url) {
                    throw new Error("Invalid arguments");
                }
                const op = "ADD";
                // URLSearchParamsでPOSTリクエストを行うと自動的にContent-Typeは
                // application/x-www-form-urlencoded になる。
                const body = new URLSearchParams();
                body.append("operator", "ADD");
                values.forEach(v => body.append("parameter", v));

                const method = "POST";
                const headers = new Headers();
                if (useCustomHeader) {
                    //headers.append("Content-Type", "application/xml");
                    // カスタムヘッダーを用いるだけではプリフライトリクエストが行われない。
                    headers.append("X-MYCUSTOMHEADER", "CustomHeaderTest");
                }
                const request = new Request(url, {method, body, headers});
                const response = await fetch(request);
                if (!response.ok) {
                    throw new Error(`Adding failed:${values}`);
                }
                return await response.json();
            },
            async delete( { url } = {}) {
                if (!url) {
                    throw new Error("Invalid arguments");
                }
                // DELETEリクエストをしてもプリフライトリクエストされない。
                const method = "DELETE";
                const request = new Request(url, {method});
                const response = await fetch(request);
                if (!response.ok) {
                    throw new Error(`Delete request failed`);
                }
                return await response.json();
            }
        };

        const throwError = msg => {
            throw new Error(msg);
        };

        const doCalc = async ({ method, useCustomHeader = false } = {}) => {
            const values = getRandomValues({
                size: 5,
                min: 1,
                max: 10
            });
            const url = "/webcise/Calculator";
            const func = calculation[method.toLowerCase()] ||
                    throwError(`${method} is unsupported`);
            return await func({values, useCustomHeader, url});
        };

        const saveXML = async ({useCustomHeader = false} = {}) => {
            const url = "/webcise/SaveXML";
            const body = `<?xml version="1.0"><sample>test</sample>`;
            const method = "POST";

            // Fetchを使ってもXMLHttpRequestを使ってもプリフライトリクエストが
            // 行われない。ローカルのリクエストに対しては決して行われないのだろうか。

            /*
             const headers = new Headers();
             headers.append("Content-Type", "application/xml");
             if (useCustomHeader) {
             headers.append("X-MYCUSTOMHEADER", "XML sample test");
             }
             const request = new Request(url, {method, body, headers});
             const response = await fetch(request);
             if (!response.ok) {
             throw new Error(`XML request failed`);
             }
             return await response.json();
             */

            // Fetchを用いた上のコードとXMLHttpRequestを用いた下のコードはほぼ同じ。

            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open(method, url, true);
                if (useCustomHeader) {
                    xhr.setRequestHeader("Content-Type", "application/xml");
                    xhr.setRequestHeader("X-MYCUSTOMHEADER", "XML sample test");
                }
                xhr.onload = () => resolve(JSON.parse(xhr.responseText));
                xhr.onerror = () => reject(new Error(`XML request failed`));
                // XMLHttpRequestで値を返すPromiseを書く場合は
                // onreadystatechangeではなくonloadプロパティを使う。
                /*
                 xhr.onreadystatechange = () => {
                 if (this.readyState === XMLHttpRequest.DONE) {
                 const r = JSON.parse(xhr.responseText);
                 resolve(r);
                 }
                 };
                 */
                xhr.send(body);
            });
        };

        const base = doc.getElementById("preflight-request-sample");
        const result = base.querySelector(".result");

        const isUseCustomHeader = () => base.querySelector(".use-custom-header").checked;
        const getMethod = () => getSelectedElementValue({base, selector: ".method"});
        const getContentType = () => getSelectedElementValue({base, selector: ".content-type"});

        base.querySelector(".run").addEventListener("click", async () => {
            const useCustomHeader = isUseCustomHeader();
            const method = getMethod();
            const contentType = getContentType();
            let content;
            if (contentType === "application/xml") {
                content = await saveXML({useCustomHeader});
            } else {
                content = await doCalc({useCustomHeader, method});
            }
            result.innerHTML += `${JSON.stringify(content)}<br />`;
        });

        base.querySelector(".clear").addEventListener("click", () => {
            result.innerHTML = "";
        });
    };

    const mixedPassiveContent = () => {
        const loadImage = async ({url, type = "blob"}) => {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Image loading failed:${response.statusText}`);
            }
            return await response[type]();
        };

        const makeUrl = ({imageName, protocol}) => {
            const url = `${protocol}://${loc.host}/webcise/images/${imageName}`;
            return url;
        };

        // DOM construction

        const base = doc.getElementById("mixed-passive-content-sample");
        const output = base.querySelector(".result");

        const display = txt => output.innerHTML += txt;
        const displayln = txt => display(txt + "<br />");

        const getSelectedProtocol = () => {
            const protocols = base.querySelectorAll(".protocol");
            const eles = Array.from(protocols).filter(p => p.checked);
            if (eles.length > 0) {
                return eles[0].value;
            } else {
                return "https";
            }
        };

        const image2Uint8 = async ({url, size}) => {
            const buffer = await loadImage({url, type: "arrayBuffer"});
            const dataView = new DataView(buffer);
            // Uint8ClampedArrayなどのTypedArrayはバイナリデータの入れ物にすぎない。
            // ArrayBufferのサイズに従って初期化したのち，DataViewを使って適切な型で
            // バイナリデータを取得して保存する。
            const array = new Uint8ClampedArray(buffer.byteLength);
            const datas = [];
            size = parseInt(size);
            if (size > 0 && !isNaN(size)) {
                const limit = size <= array.length ? size : array.length;
                for (let i = 0; i < limit; i++) {
                    const data = dataView.getUint8(i);
                    datas.push(data);
                }
            }
            return datas;
        };

        // async function* doSomething(){} のように書くとシンタックスエラーになる。
        // async generator function に対応しているブラウザは今のところ存在しない。
        function* binaryGenerator( {buffer, size}) {
            const dataView = new DataView(buffer);
            const array = new Uint8ClampedArray(buffer.byteLength);
            size = parseInt(size);
            if (size <= 0 || isNaN(size)) {
                throw new Error(`Size must be positive integer:${size}`);
            }
            const limit = size <= array.length ? size : array.length;
            for (let i = 0; i < limit; i++) {
                yield dataView.getUint8(i);
            }
        }

        let generator = null;
        let loadedBinaries = [];

        base.querySelector(".generate").addEventListener("click", async () => {
            const imageName = "star.png";
            const protocol = getSelectedProtocol();
            const url = makeUrl({imageName, protocol});
            const size = base.querySelector(".image-size").value;
            try {
                const buffer = await loadImage({url, type: "arrayBuffer"});
                generator = binaryGenerator({buffer, size});
            } catch (err) {
                display(`Cannot load image:${err.message}`);
            }
        });

        const appendLoadedImage = arrayBuffer => {
            const blob = new Blob(arrayBuffer, {type: "image/png"});
            const url = URL.createObjectURL(blob);
            const imgEle = new Image();
            imgEle.onload = () => {
                output.appendChild(imgEle);
                URL.revokeObjectURL(url);
            };
            imgEle.src = url;
        };

        base.querySelector(".run").addEventListener("click", async () => {
            /*
             const imageName = "star.png";
             const protocol = getSelectedProtocol();
             const url = makeUrl({imageName, protocol});
             const size = base.querySelector(".image-size").value;
             try {
             const datas = await image2Uint8({url, size});
             display(datas);
             } catch (err) {
             display(`Cannot load image:${err.message}`);
             }
             */
            if (generator) {
                const gen = generator.next();
                if (!gen.done) {
                    const binaryData = gen.value;
                    display(`${binaryData}&nbsp;`);
                    loadedBinaries.push(binaryData);
                } else {
                    display("Finished!");
                    // ArrayをArrayBufferに変換する。
                    const buffer = new Uint8ClampedArray(loadedBinaries).buffer;
                    try {
                        appendLoadedImage(buffer);
                    } catch (err) {
                        displayln(`Fail drawing image:${err.message}`);
                    } finally {
                        generator = null;
                        loadedBinaries = [];
                    }
                }
            }
        });

        base.querySelector(".clear").addEventListener("click", () => {
            output.innerHTML = "";
        });
    };

    const mixedActiveContent = () => {
        const base = doc.getElementById("mixed-active-content-sample");
        const output = base.querySelector(".result");

        const getProtocol = () => {
            return Array.from(base.querySelectorAll(".protocol"))
                    .filter(e => e.checked)[0].value;
        };

        const appendStylesheet = () => {
            try {
                const link = doc.createElement("link");
                link.setAttribute("rel", "stylesheet");
                link.setAttribute("href", `${getProtocol()}://${loc.host}${loc.pathname}main.css`);
                output.appendChild(link);
                output.innerHTML += `Stylesheet is loaded:${link.href}<br />`;
            } catch (err) {
                output.innerHTML += err.message;
            }
        };
        
        const appendAnchor = () => {
            try {
                const anchor = doc.createElement("a");
                anchor.setAttribute("href", `${getProtocol()}://${loc.host}${loc.pathname}`);
                output.appendChild(anchor);
                output.innerHTML += `Anchor is appended:${anchor.href}<br />`;
            } catch (err) {
                output.innerHTML += err.message;
            }
        };
        
        base.querySelector(".run").addEventListener("click", () => {
            appendStylesheet();
            appendAnchor();
        });

        base.querySelector(".clear").addEventListener("click", () => {
            output.innerHTML = "";
        });
    };
    
    const secureContexts = () => {
        const base = doc.getElementById("secure-contexts-sample");
        
        const makeCheckingUrl = ({secure = true, host = loc.host } = {}) => {
            const protocol = secure ? "https" : "http";
            return `${protocol}://${host}/${loc.pathname}/securitychecking.html`;
        };
        
        const isUseSSL = () => {
            return base.querySelector(".use-secure-protocol").checked;
        };
        
        const isSelectedHost = () => {
            return base.querySelector(".select-host").value;
        };
        
        const isNoOpener = () => {
            return base.querySelector(".use-noopener").checked;
        };
        
        base.querySelector(".open-window").addEventListener("click", () => {
            const url = makeCheckingUrl({ 
                secure: isUseSSL(), 
                host: isSelectedHost()
            });
            const rel = isNoOpener() ? "noopener" : "";
            const subWindow = win.open(url, "", rel);
            //Window.openの第3引数にnoopenerが指定されると戻り値のWindowはnullになる。
            console.log(subWindow);
        });
        
        const getCurrentPosition = () => {
            return new Promise((resolve, reject) => {
                const options = {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                };
                nav.geolocation.getCurrentPosition(resolve, reject, options);
            });
        };
        
        const restrictApiBase = base.querySelector(".restricted-api-sample");
        
        const printlnCoords = ({latitude, longitude, accuracy}) => {
            const output = restrictApiBase.querySelector(".result");
            output.innerHTML += `経度:${longitude},緯度:${latitude},精度:${accuracy}<br />`;
        };
        
        const clearOutput = () => {
            restrictApiBase.querySelector(".result").innerHTML = "";
        };
        
        restrictApiBase.querySelector(".geolocation").addEventListener("click", 
            async () => {
                    try {
                        const positionResult = await getCurrentPosition();
                        const coords = positionResult.coords;
                        //const {latitude, longitude, accuracy} = coords;
                        printlnCoords(coords);
                    } catch(err) {
                        alert(err.message);
                    }
            });
            
         restrictApiBase.querySelector(".clear").addEventListener("click", clearOutput);
    };
    
    const samples = [
        accessControlAllowOrigin,
        preflightRequest,
        mixedPassiveContent,
        mixedActiveContent,
        secureContexts
    ];

    win.addEventListener("DOMContentLoaded", () => samples.forEach(s => s()));
})(window, document, location, Math, navigator);
