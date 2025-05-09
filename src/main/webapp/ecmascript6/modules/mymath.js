// importによってのみ読み込まれているスクリプトの関数はグローバルオブジェクトにならない。
// つまりfunction式やarrow functionでソース全体を囲む必要が無い。
"use strict";

const sum = args => {
    return args.reduce((a, b) => a + b);
};

const avg = args => {
    if (args.length <= 0) {
        throw new Error("No elements.");
    }

    return sum(args) / args.length;
};

export {sum, avg};
