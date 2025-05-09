((win, doc) => {
    "use strict";

    const output = doc.querySelector("main .output");

    const checkSecureContexts = () => {
        if (win.isSecureContext) {
            output.innerHTML = "SECURE";
        } else {
            output.innerHTML = "NON-SECURE";
        }
    };

    win.addEventListener("DOMContentLoaded", checkSecureContexts);
})(window, document);
