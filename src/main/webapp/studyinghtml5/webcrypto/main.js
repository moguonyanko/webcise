const crypto = window.crypto,
    subtle = crypto.subtle;

const DEFAULT_HASH_FUNCTION_NAME = "SHA-256";
const DEFAULT_ALGORITHM = "AES-GCM";

/**
 * パスワードをハッシュ値のArrayBufferに変換する。
 * @param {String} password
 * @returns {ArrayBuffer}
 */
const getHashBuffer = async (password, hashFunc = DEFAULT_HASH_FUNCTION_NAME) => {
    // ハッシュ値の元となる文字列はArrayBufferに変換する必要がある。
    const encoder = new TextEncoder();
    const pwBuffer = encoder.encode(password);
    return await subtle.digest(hashFunc, pwBuffer);
};

/**
 * ivは「Initialization Vector」の略。IVで一般的に意味が通るようだ。
 */
const getIV = (size = 12) => {
    return crypto.getRandomValues(new Uint8Array(size));
};

/**
 * 参考:
 * https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
 */
const getHexHashValue = hashBuffer => {
    const hexCodes = [];
    const view = new DataView(hashBuffer);
    for (var idx = 0; idx < view.byteLength; idx += 4) {
        // 4バイトずつ処理するためにgetUint32を使っている。
        const value = view.getUint32(idx);
        const str = value.toString(16);
        const padding = "00000000";
        const paddedValue = (padding + str).slice(-padding.length);
        hexCodes.push(paddedValue);
    }
    return hexCodes.join("");
};

// 引数に何も受け取らなかった時も動作するようにしたいなら
// const func = ({arg1, arg2} = {}) => {} と書くとよい。
// ただし全ての必須引数にデフォルト値が指定されているべきである。
// そうしなければ関数を呼び出せたところで正常な結果が得られないからである。
// なお以下の関数ではname以外必須引数であり，その性質上適切なデフォルト値を
// 指定することができない。
const doEncrypt = async ({source, name = DEFAULT_ALGORITHM, iv, hash}) => {
    const algorithm = {name, iv};
    const key = await subtle.importKey("raw", hash, algorithm, false, ["encrypt"]);

    // 暗号化対象文字列もArrayBufferで渡す必要がある。
    const srcBuffer = new TextEncoder().encode(source);
    const encrypted = await subtle.encrypt(algorithm, key, srcBuffer);

    return encrypted;
};

const doDecrypt = async ({encrypted, iv, hash, name = DEFAULT_ALGORITHM}) => {
    const algorithm = {name, iv};
    const key = await subtle.importKey("raw", hash, algorithm, false, ["decrypt"]);

    const decrypted = await subtle.decrypt(algorithm, key, encrypted);

    return decrypted;
};

const createImage = encrypted => {
    const blob = new Blob([new Uint8Array(encrypted)], {
        type: "image/png"
    });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
        URL.revokeObjectURL(url);
        document.body.appendChild(img);
    };
    img.src = url;
};

const decodeText = src => new TextDecoder().decode(src);

const runTest = async () => {
    const source = "Hello",
        password = "password";
    console.log("Encryption target value: ");
    console.log(source);

    // TextEncoderはUTF-8でエンコードを行う。TextDecoderについても同様。
    // 仕様:
    // https://www.w3.org/TR/encoding/#dom-textencoder
    const hash = await getHashBuffer(password);
    console.log("Hash value from password: ");
    console.log(getHexHashValue(hash));

    // 暗号化と復号化で同じIVを使う必要がある。
    const iv = getIV(12);

    const encrypted = await doEncrypt({source, iv, hash});
    console.log("Encryption value(Uint8Array): ");
    console.log(new Uint8Array(encrypted).join(" "));

    const decrypted = await doDecrypt({encrypted, iv, hash});
    console.log("Decryption value: ");
    console.log(decodeText(decrypted));
};

// DOM

const displayErrorDialog = ({message, target}) => {
    const errDialogId = "error-dialog";
    const dialog = document.createElement("dialog");
    dialog.setAttribute("open", "open");
    dialog.setAttribute("id", errDialogId);
    dialog.appendChild(document.createTextNode(message));
    const body = document.body;
    const listener = event => {
        // ダイアログがクリックされた場合はダイアログを閉じない。
        if (event.target.id === errDialogId) {
            return;
        }
        if (typeof dialog.close === "function") {
            dialog.close();
        }
        target.removeChild(dialog);
        body.removeEventListener("click", listener);
        body.removeEventListener("touchend", listener);
        body.classList.toggle("dimmed");
    };
    body.addEventListener("click", listener);
    // iOSのSafariではbodyのclickイベントのリスナーを登録しても呼び出されない。
    body.addEventListener("touchend", listener);
    body.classList.toggle("dimmed");
    const oldDialog = document.getElementById(errDialogId);
    oldDialog ? target.replaceChild(oldDialog, dialog) :
        target.appendChild(dialog);
};

const addListener = () => {
    const base = document.querySelector(".encryption-sample"),
        ctrl = base.querySelector(".control-panel");

    let hash, iv, encrypted;

    const getHashFunc = () => {
        const hashEles = base.querySelectorAll(".hashfunction");
        const checkedEles = Array.from(hashEles).filter(ele => ele.checked);
        return (checkedEles[0] || {}).value || DEFAULT_HASH_FUNCTION_NAME;
    };

    const encrypt = async () => {
        const source = ctrl.querySelector(".source").value;
        const password = ctrl.querySelector(".password").value;
        if (!source || !password) {
            return;
        }
        hash = await getHashBuffer(password, getHashFunc());
        iv = getIV();
        encrypted = await doEncrypt({source, iv, hash});
        base.querySelector(".hash").innerHTML = getHexHashValue(hash);
        base.querySelector(".encrypted-array").innerHTML =
            new Uint8Array(encrypted).join(" ");
    };

    const decrypt = async () => {
        if (!hash || !iv || !encrypted) {
            return;
        }
        const decrypted = await doDecrypt({encrypted, iv, hash});
        base.querySelector(".decrypted-value").innerHTML =
            decodeText(decrypted);
    };

    ctrl.addEventListener("click", async event => {
        const target = event.target,
            clsLst = target.classList;

        const isEncrypt = clsLst.contains("encryption"),
            isDecrypt = clsLst.contains("decryption");
        if (isEncrypt || isDecrypt) {
            event.stopPropagation();
            try {
                if (isEncrypt) {
                    await encrypt();
                } else if (isDecrypt) {
                    await decrypt();
                }
            } catch (err) {
                // 復号に失敗してもエラーは発生しない？
                displayErrorDialog({
                    message: err.message,
                    target: ctrl
                });
            }
        }
    });
};

const init = async () => {
    await runTest();
    addListener();
};

window.addEventListener("DOMContentLoaded", init);
