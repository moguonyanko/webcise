// ECMAScriptで完結するスクリプトとDOMを扱うスクリプトを別々のmoduleに分ける。
const debug = false;

class Trimmer {
    constructor(content) {
        this.content = content;
    }

    trim(funcName) {
        const func = this.content[funcName];
        //const func2 = () => this.content[funcName]();
        if (typeof func === "function") {
            // Function.callを使わずにfunc()とするとTypeErrorになる。
            // この呼び出し方ではthisがレキシカルでないため目的の関数を
            // 参照することができない。
            return func.call(this.content);
            // Arrow functionを用いているfunc2ではthisがレキシカルであるため
            // 通常の関数呼び出しで正しい結果を得ることができる。
            // return func2();
        } else {
            throw new Error(`Can not use ${funcName}`);
        }
    }

    trimStart() {
        return this.trim("trimStart");
    }

    trimEnd() {
        return this.trim("trimEnd");
    }

    get contentLength() {
        return this.content.length;
    }

    toString() {
        return this.content.toString();
    }
}

const testTrimmer = () => {
    const trimmer = new Trimmer("   Lucky   ");
    console.log(trimmer.trimStart());
    console.log(trimmer.trimStart() === "Lucky   ");
    console.log(trimmer.trimEnd());
    console.log(trimmer.trimEnd() === "   Lucky");
    // trimStartにもtrimEndにも副作用は無い。
    console.log(trimmer.toString(), `全${trimmer.contentLength}文字`);
};

if (debug) {
    testTrimmer();
}

// defaultでexportするようにすれば公開するオブジェクトは常に1つになる。
// 関数名やクラス名の衝突回避やカプセル化の面では有効かもしれない。
export default Trimmer;
