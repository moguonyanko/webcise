/**
 * @fileOverview 非同期のClipboard APIを調査するためのモジュール
 */

const clipboardDescriptors = {
    read: {name: "clipboard-read"},
    write: {name: "clipboard-write"}
};

// 非同期のClipboard APIはPermission APIでユーザーの許可を得なければ
// 使用することができない。エラーが返される。
const permit = async descriptor => {
    const status = await navigator.permissions.query(descriptor);
    console.info(status);
    // 最初にユーザーに許可を求めている時はprompt、既に許可を得られている時は
    // grantedが返される。一度ブロックするとその後はずっとdeniedが返される。
    if (status.state === "granted" || status.state === "prompt") {
        return true;
    } else if (status.state === "denied") {
        return false;
    }
    return false;
};

const revokeAll = () => {
    if (typeof navigator.permissions.revoke !== "function") {
        return;
    }
    const revokePromises = Object.values(clipboardDescriptors)
        .map(value => navigator.permissions.revoke(value));
    Promise.all(revokePromises).then(results => console.info(results));
};

class ClipboardError extends Error {
    constructor(msg) {
        super(msg);
    }
}

// write及びreadの先に呼び出された方がPermission APIで許可されていれば、
// 後続のClipboard API呼び出しではPermission APIで許可を求めなくても呼び出しが成功する。
// Chrome66ではwriteTextを呼び出す前のPermission API呼び出しは常にgrantedが返る。
const writeClipboard = async text => {
    if (await permit(clipboardDescriptors.write)) {
        await navigator.clipboard.writeText(text);
    } else {
        throw new ClipboardError("Cannot write to clipboard");
    }
};

// readTextではペーストが実行された時にクリップボードに保存されていたテキストが
// 読み出される。このテキストがwriteTextで保存されたテキストである必要はない。
// 別のタブでCtrl+CでコピーされたテキストでもreadTextで読み出せる。
// Ctrl+Cでコピーされたテキストを加工してクリップボードに保存したい時はwriteTextを使う。
const readClipboard = async () => {
    if (await permit(clipboardDescriptors.read)) {
        return await navigator.clipboard.readText();
    } else {
        throw new ClipboardError("Cannot read from clipboard");
    }
};

const runTest = async () => {
    console.log(await readClipboard());
    const text = "Clipboard Text";
    await writeClipboard(text);
    const result = await readClipboard();
    console.log(`Original: ${text}, Clipboard: ${result}`);
    revokeAll();
};

const myClipBoard = {
    writeClipboard,
    readClipboard,
    test: {
        runTest
    }
};

export default myClipBoard;
