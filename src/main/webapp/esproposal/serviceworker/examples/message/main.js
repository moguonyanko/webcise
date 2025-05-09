((window, document, navigator) => {
    "use strict";

    const sw = navigator.serviceWorker;

    const register = async () => await sw.register("./sw.js", {scope: "./"});

    const unregister = async () => {
        const registration = await sw.ready;
        registration && registration.unregister();
    };

    const getJSON = async url => {
        const response = await fetch(url);
        return await response.json();
    };

    window.addEventListener("DOMContentLoaded", async () => {
        const reg = document.querySelector(".register"),
            unreg = document.querySelector(".unregister"),
            ld = document.querySelector(".load"),
            res = document.querySelector(".result");

        reg.addEventListener("click", async () => await register());

        unreg.addEventListener("click", async () => await unregister());

        ld.addEventListener("click", async () => {
            const json = await getJSON("./sample.json");
            res.innerHTML += `${JSON.stringify(json)}<br />`;
        });

        sw.addEventListener("message", event => {
            const {url, message} = event.data;
            res.innerHTML += `${url}: ${message}<br />`;
        });
    });
})(window, document, navigator);
