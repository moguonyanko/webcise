((window, document, navigator) => {
    "use strict";

    const sw = navigator.serviceWorker;
    
    const qs = (selector, element = document) => {
        return element.querySelector(selector);
    };
    
    const infoArea = qs(".info-area");

    const aelc = (selector, listener) => {
        qs(selector).addEventListener("click", listener);
    };

    const display = content => {
        infoArea.innerHTML += content + "<br />";
    };

    const subscribe = async registration => {
        const subscription = await registration.pushManager.subscribe();
        console.log(subscription);
        display(JSON.stringify(subscription));
        // TODO: pushイベントを発生させられていない。
        window.addEventListener("push", event => {
            console.log(event);
        });
        return subscription;
    };

    const register = async () => {
        if (!sw) {
            return;
        }
        const url = "sw.js", scope = "./";
        return await sw.register(url, {scope});
    };

    const init = () => {
        aelc(".register", async () => {
            const registration = await register();
            subscribe(registration);
        });

        aelc(".updater", async () => {
            const registration = await register();
            registration.update();
        });
        
        aelc(".clearer", () => infoArea.innerHTML = "");
    };

    window.addEventListener("DOMContentLoaded", init);
})(window, document, navigator);
