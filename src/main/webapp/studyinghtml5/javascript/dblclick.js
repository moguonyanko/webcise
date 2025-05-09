const slowFunction = (message, callback) => {
    // ダブルクリックを発生させやすくするためにわざと1秒間遅らせる。
    setTimeout(() => {
        alert(message);
        callback();
    }, 1000);
};

const addListener = () => {
    const container = document.querySelector(".target-container");
    container.addEventListener("click", event => {
        if (event.target.classList.contains("target")) {
            event.stopPropagation();
            // ダブルクリック防止のためボタンを無効化
            event.target.setAttribute("disabled", "disabled");
            slowFunction(event.target.value, () => {
                // ダブルクリック防止のためのボタン無効化解除
                event.target.removeAttribute("disabled");
            });
        }
    });
};

const init = () => {
    addListener();
};

window.addEventListener("DOMContentLoaded", init);
