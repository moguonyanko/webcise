((window, document) => {
    "use strict";

    const sw = navigator.serviceWorker;

    const registerSW = async () => {
        if (sw) {
            await sw.register("sw.js");
        }
    };

    const displaySearchKeyword = () => {
        const keyword = document.querySelector("main .search");
        const search = location.search;
        keyword.innerHTML = search;
    };

    window.addEventListener("DOMContentLoaded", async () => {
        await registerSW();
        displaySearchKeyword();
    });
})(window, document);
