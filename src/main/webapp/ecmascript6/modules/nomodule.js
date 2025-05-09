((window, document) => {
    "use strict";
    
    const main = () => {
        const base = document.querySelector(".nomodule-support-example");
        const result = base.querySelector(".result-area");
        result.innerHTML += "NO MODULE!<br />";
    };
    
    window.addEventListener("DOMContentLoaded", main);
})(window, document);
