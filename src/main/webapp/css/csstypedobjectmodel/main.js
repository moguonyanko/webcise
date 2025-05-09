import mcm from "./cssom.js";

const changeOpacity = opacityValue => {
    const uniEle = new mcm.CSSUnitElement({
        element: document.querySelector(".samplecontent")
    });
    uniEle.setValue({
        name: "opacity",
        value: opacityValue
    });
    const displayEle = document.querySelector(".stylevalue");
    const unitValue = uniEle.opacity;
    displayEle.innerHTML = `${unitValue.value}`;
};

const addListener = () => {
    const base = document.querySelector(".section-1");
    base.addEventListener("change", event => {
        if (event.target.classList.contains("eventtarget")) {
            event.stopPropagation();
            if (event.target.classList.contains("opacity")) {
                changeOpacity(event.target.value);
            }
        }
    });
};

const init = () => {
    mcm.test.runTest();
    addListener();
};

window.addEventListener("DOMContentLoaded", init);
