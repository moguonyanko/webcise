import authLib from "./element.js";

customElements.define("custom-authentication", authLib.MyAuth, { extends: "form" });
