const examples = {
    defaultSrcExample() {
        return {
            init() {
                const base = document.querySelector(".default-src-example"),
                    runner = base.querySelector(".runner");
                const listener = () => {
                    const url = "//localhost/webcise/security/csp/dummy.js";
                    const newSc = document.createElement("script");
                    const klass = "dummy-script";
                    newSc.setAttribute("class", klass);
                    newSc.setAttribute("type", "module");
                    newSc.setAttribute("src", url);
                    const oldSc = base.querySelector(`.${klass}`);
                    if (oldSc) {
                        base.replaceChild(newSc, oldSc);
                    } else {
                        base.appendChild(newSc);
                    }
                };
                runner.addEventListener("click", listener);
            }
        };
    }
};

const init = () => Object.keys(examples).forEach(key => examples[key]().init());

window.addEventListener("DOMContentLoaded", init);
