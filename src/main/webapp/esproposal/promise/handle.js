const dumpPromiseEvent = event => {
    console.log(event);
};

const getPromise = () => Promise.reject(new Error("Test rejection!"));

const runTest = () => {
    window.addEventListener("rejectionhandled", dumpPromiseEvent);
    window.addEventListener("unhandledrejection", dumpPromiseEvent);
    const resolved = value => {
        console.log(`Resolved: ${value}`);
    };
    const rejected = err => {
        console.log(`Rejected: ${err.message}`);
    };
    // Promise.thenにreject関数を渡さなかった時あるいはcatch関数を記述しなかった時に
    // rejectされるとunhandledrejectionイベントが発生する。
    getPromise().then(resolved);
    // 以下のコードではunhandledrejectionイベントは発生しない。
    //getPromise().then(resolved, rejected);
    //getPromise().then(resolved).catch(rejected);
};

const addPageListener = () => {
    const base = document.querySelector(".promise-event-example");
    const output = base.querySelector(".output");
    const runner = base.querySelector(".runner");
    const reportResult = event => {
        output.innerHTML += `${event.type}<br />`;
    };
    runner.addEventListener("click", () => {
        // thenの第2引数にreject関数を渡しても渡さなくてもrejectionhandledイベントは発生しない。
        // Promise生成時のrejectに渡したErrorがスローされるだけである。
        // rejectionhandledイベントが発生する条件が不明。
        window.addEventListener("rejectionhandled", reportResult);
        window.addEventListener("unhandledrejection", reportResult);
        getPromise().then(() => {
            console.log("必ずRejectされるのでこれは呼び出されない");
        });
    });
};

const main = () => {
    runTest();
    addPageListener();
};

main();
