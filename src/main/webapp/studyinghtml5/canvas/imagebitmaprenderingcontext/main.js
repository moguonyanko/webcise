import mc from "./mycanvas.js";

const drawSampleShape = () => {
    const src = document.querySelector(".srccanvas");
    const srcCtx = src.getContext("2d");
    srcCtx.fillStyle = "green";
    srcCtx.fillRect(10, 10, 200, 100);
    srcCtx.fillStyle = "violet";
    srcCtx.font = "2rem monospace";
    srcCtx.fillText("Bitmap", src.width / 2, src.height / 2);
};

const initCanvas = () => {
    Array.from(document.querySelectorAll("canvas")).forEach(canvas => {
        const context = canvas.getContext("2d");
        context.fillStyle = "beige";
        context.fillRect(0, 0, canvas.width, canvas.height);
    });

    drawSampleShape();
};

// SafariTPにはOffscreenCanvasが実装されているがgetContext("webgl")で
// WebGLRenderingContextを得ることしかできない。getContext("2d")の戻り値は
// nullになる。WebGLRenderingContextにtransferFromImageBitmapは実装されていない。
const getOffscreenCanvas = ({width, height}) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
};

const transferImage = async ({src, dist, mimeType}) => {
    const blob = await mc.getBlob({
        canvas: src,
        mimeType
    });
    const canvas = getOffscreenCanvas({
        width: dist.width,
        height: dist.height
    });
    await mc.drawImage({
        // ドキュメントに追加されているcanvasからはImageBitmapRenderingContextを
        // 取得することができないためエラーとなってしまう。
        //canvas: dist,
        canvas,
        blob
    });
    dist.getContext("2d").drawImage(canvas, 0, 0);
};

const eventListener = async event => {
    if (event.target.classList.contains("mc-event")) {
        event.stopPropagation();
        if (event.target.classList.contains("mc-event-transfer")) {
            const dist = document.querySelector(".distcanvas");
            dist.getContext("2d").clearRect(0, 0, dist.width, dist.height);
            const mimeType = Array.from(document.querySelectorAll(".mimetype"))
                .filter(ele => ele.checked)
                .pop()
                .value;
            await transferImage({
                src: document.querySelector(".srccanvas"),
                dist,
                mimeType
            });
        }
    }
};

const addListener = () => {
    const ctrl = document.querySelector(".control");
    const options = {
        passive: true
    };
    // 少なくともデスクトップのChrome66上のマウス操作ではpointerupイベントは発生しない。
    ctrl.addEventListener("mouseup", eventListener, options);
    ctrl.addEventListener("touchend", eventListener, options);
};

const main = async () => {
    //await mc.test.runTest();
    initCanvas();
    addListener();
};

window.addEventListener("DOMContentLoaded", main);
