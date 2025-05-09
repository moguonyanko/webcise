import myTemplate from "./template.js";

const defineElement = () => {
    customElements.define("bigint-example", myTemplate.BigIntPractice);
};

const init = () => {
    defineElement();
}; 

window.addEventListener("DOMContentLoaded", init);
