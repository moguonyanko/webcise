import mo from "./element.js";

const defineElement = () => {
    customElements.define("infinity-scroller", mo.InfiniteScrolling);
};

const init = () => {
    defineElement();
};

window.addEventListener("DOMContentLoaded", init);
