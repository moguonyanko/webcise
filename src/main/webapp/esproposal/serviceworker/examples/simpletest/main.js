((window, document, navigator) => {
    "use strict";

    const sw = navigator.serviceWorker;

    const register = async () => {
        const registration = await sw.register("./sw.js", {scope: "./"});
        return registration;
    };

    const init = async () => {
        const loader = document.querySelector(".loader");
        const unregister = document.querySelector(".unregister");
        const updater = document.querySelector(".updater");
        const result = document.querySelector(".result");

        loader.addEventListener("click", async () => {
            try {
                const registration = await register();
                unregister.addEventListener("click", () =>
                    registration && registration.unregister());
                updater.addEventListener("click", () =>
                    registration && registration.update());
                const response = await fetch("./sample.json");
                const json = await response.json();
                result.innerHTML += `${JSON.stringify(json)}<br />`;
            } catch (err) {
                result.innerHTML += `${err.message}<br />`;
            }
        });
    };

    window.addEventListener("DOMContentLoaded", init);
})(window, document, navigator);
