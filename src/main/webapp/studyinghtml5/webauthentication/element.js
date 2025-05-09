/**
 * 参考:
 * https://developers.google.com/web/updates/2018/05/webauthn
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API
 */

// WebAuthn

// Relying Party
// 適当な値ではSecuryErrorとなる。
const rp = {
    name: "Acme"
};

const getBuffer = async url => {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    return buf;
};

const challenges = {
    async register() {
        const buf = await getBuffer("image/register_challenge.png");
        return new Uint8Array(buf, 0, 32).buffer;
    },
    async get() {
        const buf = await getBuffer("image/get_challenge.png");
        return new Uint8Array(buf, 0, 32).buffer;
    }
};

const credentials = {
    async allow() {
        const buf = await getBuffer("image/allow_credentials.png");
        return new Uint8Array(buf, 0, 80).buffer;
    }
};

// TODO: 認証を完了できない。
const register = async user => {
    const challenge = await challenges.register();
    const credential = await navigator.credentials.create({
        publicKey: {
            challenge,
            rp,
            user,
            attestation: "direct",
            timeout: 60000,
            pubKeyCredParams: [{
                type: "public-key",
                alg: -7    
            }]
        }
    });
    return credential;
};

const authenticate = async cred => {
    const challenge = await challenges.get();
    const credentials = await navigator.credentials.get({
        publicKey: {
            challenge,
            rpId: rp.id,
            allowCredentials: [{
                type: "public-key",
                transports: ["usb", "nfc", "ble"],
                id: cred.rawId
            }],
            userVerification: "required"
        }
    });
    return credentials;
};

const authMethods = { 
    register,
    authenticate
};

class User {
    constructor({id, name, displayName}) {
        this.id = id;
        this.name = name;
        this.displayName = displayName;
    }
}

// custom element

class MyAuth extends HTMLFormElement {
    constructor() {
        super();
    }
    
    getUserId() {
        return new Promise((resolve, reject) => {
            const idEle = this.querySelector(".user.authImage");
            if (!idEle.files || idEle.files.length <= 0) {
                reject(new Error("Not selected id file"));
                return;
            }
            const imgFile = idEle.files[0];
            const reader = new FileReader();
            reader.onload = buf => {
                const ua = new Uint8Array(buf, 0, 16);
                resolve(ua);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(imgFile);
        });
    }
    
    async getUser() {
        const id = await this.getUserId();
        
        const nameEle = this.querySelector(".user.name");
        const name = nameEle.value;
        
        const displayNameEle = this.querySelector(".user.displayName");
        const displayName = displayNameEle.value;
        
        return new User({id, name, displayName});
    }
    
    connectedCallback() {
        this.addEventListener("click", async event => {
            if (event.target.classList.contains("auth")) {
                event.stopPropagation();
                const method = event.target.value;
                let cred;
                if (method === "register") {
                    cred = await authMethods.register(await this.getUser());
                    this.credentials = cred;
                } else if (method === "get" && this.credentials) {
                    cred = await authMethods.get(this.credentials);
                }
                if (cred) {
                    console.log(cred);
                    const resultArea = this.querySelector(".resultarea");
                    resultArea.value = cred.toString();
                }
            }
        });
    }
}

const authLib = {
    MyAuth
};

export default authLib;
