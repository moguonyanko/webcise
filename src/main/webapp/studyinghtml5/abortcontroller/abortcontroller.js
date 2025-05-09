/**
 * @fileOverview AbortControllerを調査するためのモジュール
 */

class FetchError extends Error {
    constructor(message) {
        super(message);
    }
}

const isValidURL = url => {
    try {
        new URL(url);
        return true;
    } catch (err) { // ブラウザによっては (err) は無くてもいい。
        try {
            new URL(`${location.href}/${url}`);
            return true;
        } catch (err) {
            return false;
        }
    }
};

class FetchTarget {
    constructor( {url, type}) {
        this.url = url;
        this.type = type;
    }
}

class Fetching {
    constructor( {targets, onAborted = () => {}}) {
        this.controllers = new Map();
        this.onAborted = onAborted;
        targets.forEach(target => {
            const controller = new AbortController();
            controller.signal.addEventListener("abort", event => onAborted({
                    event,
                    target
                }));
            this.controllers.set(target, controller);
        });
    }

    async doFetch(target) {
        if (!isValidURL(target.url)) {
            throw new FetchError("Invalid URL");
        }
        if (typeof Response.prototype[target.type] !== "function") {
            throw new FetchError(`"${target.type}" is invalid response type`);
        }
        if (!this.controllers.has(target)) {
            throw new FetchError("Not found fetch target");
        }
        const controller = this.controllers.get(target);
        const signal = controller.signal;
        const response = await fetch(target.url, {signal});
        if (!response.ok) {
            throw new FetchError(`Failed fetch: ${response.status}`);
        }
        return await response[target.type]();
    }

    // 非同期にすることでsetTimeoutで遅延して呼び出されるfetchに
    // 割り込んでabortすることを試みている。しかしブラウザによっては
    // 割り込めない。fetch開始前にabortしてもエラーにはならないが後続の
    // fetchには全く影響が無い。
    doAbort(target) {
        return new Promise((resolve, reject) => {
            if (this.controllers.has(target)) {
                const controller = this.controllers.get(target);
                try {
                    controller.abort();
                } finally {
                    // 一度abortすると同じAbortControllerを使ってfetchを行うことができない。
                    // 再びfetchできるようにAbortControllerを登録し直している。
                    const newController = new AbortController();
                    const listener = event => this.onAborted({
                            event,
                            target
                        });
                    newController.signal.addEventListener("abort", listener);
                    this.controllers.set(target, newController);
                    resolve(target);
                }
            } else {
                reject(new FetchError(`Missing AbortController`));
            }
        });
    }
}

const runTest = async () => {
    const url = "sample.json";
    //const url = "sampleerror.json"; //わざと404エラーになるURLを指定する。
    const target = new FetchTarget({
        url,
        type: "json"
    });
    const fh = new Fetching({
        targets: [target],
        onAborted: event => console.info(event)
    });
    let json = {};
    try {
        json = await fh.doFetch(target);
    } catch (err) {
        fh.doAbort(target);
    } finally {
        console.log(json);
    }
};

const myAbortController = {
    FetchTarget,
    Fetching,
    // クライアント側まで伝搬する例外は公開するべきである。
    // そうしないとinstanceofなどで例外の型を参照することができない。
    FetchError,
    test: {
        runTest
    }
};

export default myAbortController;
