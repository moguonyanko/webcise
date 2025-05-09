/**
 * @fileOverview CSS Typed Object Model調査用モジュール
 */

// CSS.numberでCSSUnitValueが返されるのは変な感じもする。
// CSS.pxやCSS.percentのpxやpercentと違い、numberは単位ではないからである。
class CSSUnitElement {
    constructor( {element, defaultUnit = "number"}) {
        this.element = element;
        this.defaultUnit = defaultUnit;
    }

    setValue( {name, value, unit = this.defaultUnit}) {
        if (unit in CSS) {
            const cssUnitValue = CSS[unit](value);
            this.element.attributeStyleMap.set(name, cssUnitValue);
        } else {
            // 後方互換を重視しないならここでTypeErrorをスローするべきである。
            // 単位を付けなかったり無効な単位だと代入に成功しても取得できない。
            // 単位がnumberの場合は値に単位を付加してはいけない。
            // 「50number」といったおかしな値になってしまう。
            if (this.defaultUnit !== "number") {
                this.element.style[name] = `${value}${this.defaultUnit}`;
            } else {
                this.element.style[name] = value;
            }
        }
        // 引数のnameで値を得るためのgetterを定義しておく。
        Object.defineProperty(this, name, {
            get: () => {
                const attrMap = this.element.attributeStyleMap;
                if (attrMap && attrMap.has(name)) {
                    return attrMap.get(name);
                } else {
                    const value = this.element.style[name];
                    // CSSUnitValueと同じプロパティを定義したオブジェクトを返す。
                    return {value, unit};
                }
            }
        });
    }

    get attributes() {
        // attributeStyleMapにはこれまでに設定された全てのスタイル情報が含まれている。
        // computedStyleMapとマージしたりする必要はない。
        const attrMap = this.element.attributeStyleMap;
        if (attrMap) {
            return new Map(attrMap);
        } else {
            const keyValues = Array.from(this.element.style)
                .map(key => [key, this.element.style[key]]);
            return new Map(keyValues);
        }
    }
}

const runTest = () => {
    const unitEle = new CSSUnitElement({
        element: document.createElement("div"),
        defaultUnit: "px"
    });
    unitEle.setValue({
        name: "width",
        value: "100",
        unit: "percent"
    });
    const unitValue = unitEle.width;
    console.log(unitValue);
    unitEle.setValue({
        name: "height",
        value: "50",
        unit: "dummy" // CSSオブジェクトに存在しないプロパティをわざと指定する。
    });
    console.log(unitEle.width, unitEle.height);
    console.log(unitEle.attributes);
};

const myCSSOM = {
    CSSUnitElement,
    test: {
        runTest
    }
};

export default myCSSOM;
