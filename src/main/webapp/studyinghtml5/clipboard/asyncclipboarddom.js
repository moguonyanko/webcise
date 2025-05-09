import acb from "./asyncclipboard.js";

const logError = e => console.error(e);

const addListener = () => {
    const base = document.querySelector(".async-clipboard-base");
    const container = base.querySelector(".cliptarget-container");
    container.addEventListener("copy", async event => {
        if (event.target.classList.contains("cliptarget")) {
            // copyイベントに対して登録された別のイベントリスナーで
            // テキストがコピーされないようにstopPropagationではなく
            // stopImmediatePropagationを呼び出す。
            event.stopImmediatePropagation();
            const text = event.target.innerText;
            if (text) {
                // コピーしたテキストを加工してクリップボードに保存する。
                await acb.writeClipboard(text.toUpperCase());
            }
        }
    });
    const pasteArea = base.querySelector(".paste-area");
    pasteArea.addEventListener("paste", async event => {
        event.stopImmediatePropagation();
        const text = await acb.readClipboard();
        pasteArea.innerHTML += `${text}<br/>`;
    });
    base.addEventListener("click", event => {
        if (event.target.classList.contains("clearer")) {
            event.stopPropagation();
            pasteArea.innerHTML = "";
        }
    });
};

const main = async () => {
    //await acb.test.runTest();
    addListener();
};

window.addEventListener("DOMContentLoaded", main);
// Promise関連エラー補足用イベントリスナー登録
window.addEventListener("unhandledrejection", logError);
