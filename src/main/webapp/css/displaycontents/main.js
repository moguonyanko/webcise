const formListener = event => {
    if (event.target.name === "switch-style") {
        event.stopPropagation();
        const encloser = document.querySelector(".enclosing");
        const value = event.target.value;
        if (value === "contents") {
            encloser.classList.add("contents-box");
        } else {
            encloser.classList.remove("contents-box");
        }
    }
};

const addListener = () => {
    const options = {
        passive: true
    };
    const form = document.querySelector(".switch-style-form");
    form.addEventListener("click", formListener, options);
};

const main = () => {
    addListener();
};

window.addEventListener("DOMContentLoaded", main);
