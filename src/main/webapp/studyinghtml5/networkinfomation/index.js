import nLib from "./networkinfomation.js";

const defineElements = () => {
    customElements.define("connection-type", class extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({mode: "open"});
            const template = document.querySelector(".network-type-template");
            shadow.appendChild(template.content.cloneNode(true));
        }

        connectedCallback() {
            const root = this.shadowRoot;
            const result = root.querySelector(".result");
            root.addEventListener("click", event => {
                if (!event.target.classList.contains("target")) {
                    return;
                }
                event.stopPropagation();
                if (event.target.classList.contains("checktype")) {
                    const type = nLib.netinfo.getConnectionType();
                    result.innerHTML += `${type}<br />`;
                }
            });
        }
    });

    customElements.define("connection-change", class extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({mode: "open"});
            const template = document.querySelector(".network-change-template");
            shadow.appendChild(template.content.cloneNode(true));
        }

        connectedCallback() {
            const root = this.shadowRoot;
            const result = root.querySelector(".result");
            const con = nLib.netinfo.getConnection();
            con.addEventListener("change", event => {
                const info = nLib.netinfo.getConnectionInfomation(con);
                result.innerHTML += `${info}<br />`;
            });
        }
    })
};

window.addEventListener("DOMContentLoaded", () => {
    nLib.netinfo.runTest();
    defineElements();
});
