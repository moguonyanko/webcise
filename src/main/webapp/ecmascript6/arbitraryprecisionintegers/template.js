import bi from "./bigint.js";

const eventListeners = {
    toBigInt: ({resArea, value}) => {
        const result = bi.toBigInt(value);
        resArea.innerHTML += `${result} typeof ${typeof result}<br >`;
    },
    asBigInt: ({resArea, bit, value}) => {
        const result = bi.asBigInt({bit, value});
        resArea.innerHTML += `${result} by ${bit} bit<br >`;
        const unsigned = true;
        const unsignedResult = bi.asBigInt({bit, value, unsigned});
        resArea.innerHTML += `Unsigned: ${unsignedResult} by ${bit} bit<br >`;
    },
    toBigIntArray: ({resArea, size, value}) => {
        const array = new Array(size).fill(value);
        const result = bi.toBigInt64Array({array});
        resArea.innerHTML += `${result}<br >`;
        const unsigned = true;
        const unsignedResult = bi.toBigInt64Array({array, unsigned});
        resArea.innerHTML += `Unsigned Array: ${unsignedResult}<br >`;
    }
};

const targetClassNames = [
    "bigintvalue", "bit", "bigintarraysize"
];

class BigIntPractice extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({mode: "open"});
        const template = document.querySelector(".bigint-practice-template");
        shadow.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        const root = this.shadowRoot;
        const resArea = root.querySelector(".resultarea");
        const ctrl = root.querySelector(".control");
        ctrl.addEventListener("change", event => {
            if (event.target.classList.contains("target")) {
                event.stopPropagation();
                if (targetClassNames.some(cls => event.target.classList.contains(cls))) {
                    // BigInt型として扱う予定の値にparseIntを適用するべきでない。精度が落ちる。
                    const value = ctrl.querySelector(".bigintvalue").value;
                    eventListeners.toBigInt({resArea, value});
                    const bit = parseInt(ctrl.querySelector(".bit").value);
                    eventListeners.asBigInt({resArea, bit, value});
                    const size = parseInt(ctrl.querySelector(".bigintarraysize").value);
                    eventListeners.toBigIntArray({resArea, size, value});
                }
            }
        });
        ctrl.addEventListener("click", event => {
            if (event.target.classList.contains("target")) {
                if (event.target.classList.contains("clear")) {
                    resArea.innerHTML = "";
                }
            }
        });
    }
}

bi.test.runTest();

const module = {
    BigIntPractice
};

export default module;
