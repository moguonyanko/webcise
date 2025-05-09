// importは最初に記述されなければならないのでfunction式で囲むことはできない。
// type="module"で読み込まれたスクリプトで宣言された変数はwindowオブジェクトに
// 自動的に紐付けられたりしないのでfunction式で囲む必要が無い。
// strictモードの宣言はimportより先に記述しても問題無い。
"use strict";

import * as mymath from "./mymath.js";

const g = window.goma;

const inits = [
    () => {
        const baseCls = ".import-container ";
        const resultArea = g.select(baseCls + ".result-area");
        g.clickListener(g.select(baseCls + ".calc-executer"), function () {
            const values = g.values(g.selectAll(baseCls + ".calc-source-value"), Number);
            const result = mymath.avg(values);
            g.println(resultArea, result);
        });
    }
];

g.run(inits);
