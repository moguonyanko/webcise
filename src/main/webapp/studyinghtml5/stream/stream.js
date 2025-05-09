const createReadableStream = async src => {
    const response = await fetch(src);
    const stream = response.body;
    const reader = stream.getReader();
    const readableStream = new ReadableStream({
        async start(controller) {
            while (true) {
                // readで返されるのはジェネレータではなくPromiseである。
                // 少なくともこの書き方では一度に全てのデータを読んでしまうようである。
                const {value, done} = await reader.read();
                if (done) {
                    break;
                }
                controller.enqueue(value);
            }
            controller.close();
            reader.releaseLock();
        }
    });
    return readableStream;
};

class SimpleImageStream extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({mode: "open"});
        const template = document.querySelector(".simple-image-stream-template");
        shadow.appendChild(template.content.cloneNode(true));
    }

    createImage(blob) {
        const img = new Image();
        img.setAttribute("class", "stream-image");
        img.width = this.getAttribute("width");
        img.height = this.getAttribute("height");
        const url = URL.createObjectURL(blob);
        img.onload = () => URL.revokeObjectURL(url);
        img.src = url;
        return img;
    }

    async connectedCallback() {
        const base = this.shadowRoot.querySelector(".base");

        const src = this.getAttribute("src");
        const rs = await createReadableStream(src);
        const blob = await new Response(rs).blob();

        const count = parseInt(this.getAttribute("count"));
        if (!isNaN(count) && count > 0) {
            for (let i = 0; i < count; i++) {
                base.appendChild(this.createImage(blob));
            }
        }
    }
}

let readableNumber = 1;
let readedNumbers = [];

// readableNumberがlimitに達する前に呼び出された場合であってもdoneはtrueになっていない。
// しかしその時CustomNumberStreamのpullが呼び出されてdoReadが中止される。
// なおlimitに達した後呼び出された場合でもdoneがtrueになっていることは無い。
const readStream = async ({stream, limit}) => {
    const reader = stream.getReader();
    while (true) {
        const {done, value} = await reader.read();
        if (done || value > limit) {
            console.log(`Done -> ${done}, value > limit -> ${value > limit}`);
            break;
        }
        readedNumbers.push(value);
    }
    // 呼び出しても呼び出さなくてもエラーにはならない。
    reader.releaseLock();
};

const getAttributes = ({obj, attributeNames = [], parser = v => v}) => {
    const attribtues = attributeNames.reduce((acc, name) => {
        const elementAttr = obj.getAttribute(name);
        const attr = parser(elementAttr);
        if (isNaN(attr)) {
            throw new TypeError(`Invalid attribute: ${elementAttr}`);
        }
        acc[name] = attr;
        return acc;
    }, {});
    return attribtues;
};

/**
 * @description 
 * ReadableStreamDefaultControllerに連番をenqueueしていって、
 * 後でreadしその結果を出力するサンプルcustom element。
 */
class CustomNumberStream extends HTMLElement {
    constructor() {
        super();

        Object.assign(this, getAttributes({
            obj: this,
            attributeNames: [
                "initial",
                "limit",
                "interval"
            ],
            parser: parseInt
        }));

        this.initialNumber = parseInt(this.getAttribute("initial"));
        this.limitNumber = parseInt(this.getAttribute("limit"));
        this.interval = parseInt(this.getAttribute("interval"));

        const shadow = this.attachShadow({mode: "open"});
        const template = document.querySelector(".custom-number-stream-template");
        shadow.appendChild(template.content.cloneNode(true));
    }

    get output() {
        const base = this.shadowRoot.querySelector(".base");
        return base.querySelector(".output");
    }

    connectedCallback() {
        const base = this.shadowRoot.querySelector(".base");
        const output = this.output;
        const limit = this.limitNumber;
        const interval = this.interval;
        let number = this.initialNumber;
        let intervalId;

        const doRead = async ({stream, controller}) => {
            clearInterval(intervalId);
            await readStream({stream, limit});
            output.innerHTML += `Readed numbers: ${readedNumbers} limit ${limit}<br />`;
            // releaseLockをclose内部で呼び出しているのかもしれない。
            controller.close();
        };
        
        const resetNumber = () => {
            number = this.initialNumber;
        };

        const stream = new ReadableStream({
            start(controller) {
                base.addEventListener("click", event => {
                    if (event.target.classList.contains("start")) {
                        resetNumber();
                        this.counting = true;
                        intervalId = window.setInterval(() => {
                            output.innerHTML = `${number}<br />`;
                            controller.enqueue(number++);
                        }, interval);
                    }
                });
                
                base.addEventListener("click", async event => {
                    if (event.target.classList.contains("read") && this.counting) {
                        this.counting = false;
                        event.stopPropagation();
                        await doRead({stream, controller});
                    }
                });
            },
            pull(controller) {
                console.log("Pulled");
                console.log(controller);
            },
            cancel(reason) {
                console.log(`Canceled: ${reason}`);
                clearInterval(intervalId);
            }
        });
    }
}

class TeeStream extends HTMLElement {
    constructor() {
        super();
        
        this.number = 0;
        this.interval = 500;
        this.teedSize = 0;
        
        const shadow = this.attachShadow({mode: "open"});
        const template = document.querySelector(".tee-stream-template");
        shadow.appendChild(template.content.cloneNode(true));
    }
    
    get incrementNumber() {
        return this.number++;
    }
    
    appendNumber(number, selector) {
        let element = this.shadowRoot.querySelector(selector);
        if (!element) {
            element = document.createElement("div");
            element.setAttribute("class", `result-line ${selector}`);
            this.shadowRoot.appendChild(element);
        }
        element.innerHTML += `<span class="number">${number}</span>`;
    }
    
    start(stream, controller) {
        this.intervalId = setInterval(() => {
            const number = this.incrementNumber;
            controller.enqueue(number);
            this.appendNumber(number, ".result-main");
        }, this.interval);
    }
    
    async readStream(stream, selector) {
        const reader = stream.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                return `${selector} is done`;
            }
            this.appendNumber(value, selector);
        }
    }
    
    tee(stream, controller) {
        clearInterval(this.intervalId);
        // teeされたstream全てにcontrollerは紐づいている。従ってteeされた後の
        // controller.enqueueは元のstreamとteeされたstream全てに影響を与える。
        // 2回目以降のteeではstreamがlockされているためエラーになる。
        const teedStreams = stream.tee();
        // teeされたstreamはどれも元のstreamと同じ値を含んでいる。
        // 配列を半分にしたような結果になるわけではない。
        const promises = teedStreams.map((stm, idx) => {
            return this.readStream(stm, `.result-tee${this.teedSize + idx}`);
        });
        this.teedSize += teedStreams.length;
        // teeされて生じたstream群を並列して読み込む。
        Promise.all(promises).then(results => {
            // controller.closeが呼び出された時にこのブロックは評価される。
            console.log("Results:", results);
        }).catch(() => {
            controller.close();
        });
    }
    
    stop(stream, controller) {
        clearInterval(this.intervalId);
        controller.close();
    }
    
    connectedCallback() {
        const that = this;
        const root = that.shadowRoot;
        const stream = new ReadableStream({
            start(controller) {
                root.addEventListener("click", event => {
                    if (!event.target.classList.contains("target")) {
                        return;
                    }
                    event.stopPropagation();
                    if (typeof that[event.target.value] === "function") {
                        that[event.target.value](stream, controller);
                    }
                });
            },
            pull(controller) {
                // Does nothing.
            },
            cancel() {
                clearInterval(that.intervalId);
            }
        });
    }
}

const getTeedBlobs = async src => {
    const response = await fetch(src);
    if (!response.ok) {
        throw new Error(`Loading is failed: ${response.status}`);
    }
    // streamを使う練習なのでbodyを参照している。blobが欲しいだけなら
    // response.blob()を呼び出せばよい。
    const stream = await response.body;
    // teeされた元のstreamはロックされる。
    const promises = stream.tee().map(async (stream, index) => {
        const reader = stream.getReader();
        const buf = [];
        while (true) {
            // readを呼び出すと画像データを「全て」読んでしまう。
            // もっと大きな画像なら分割して読み込まれるのだろうか。
            // readメソッドに読み込むサイズを指定するような引数は存在しない。
            const {done, value} = await reader.read();
            if (done) {
                // Blobコンストラクタを使いArrayBufferをBlobに変換する。
                // 引数のArrayBufferが配列でないと正常なBlobが生成されない。
                return new Blob(buf);
            }
            if (index === 1) {
                // TODO: 何らかの画像変更処理
            }
            buf.push(value);
        }
    });
    return Promise.all(promises);
};

// DOMへのアクセスはCustom Elementまでで抑えたい。
class TeeImageStream extends HTMLElement {
    constructor() {
        super();
        
        const shadow = this.attachShadow({mode: "open"});
        const template = document.querySelector(".tee-image-template");
        shadow.appendChild(template.content.cloneNode(true));
    }
    
    connectedCallback() {
        const root = this.shadowRoot;
        root.addEventListener("click", async event => {
            if (!event.target.classList.contains("target")) {
                return;
            }
            event.stopPropagation();
            const blobs = await getTeedBlobs(this.getAttribute("src"));
            blobs.forEach(blob => {
                const url = URL.createObjectURL(blob);
                const img = new Image();
                img.onload = () => {
                    URL.revokeObjectURL(url);
                    const container = root.querySelector(".result-container");
                    container.appendChild(img);
                };
                img.src = url;
            });
        });
    }
}

const streamLib = {
    element: {
        SimpleImageStream,
        CustomNumberStream,
        TeeStream,
        TeeImageStream
    }
};

export default streamLib;
