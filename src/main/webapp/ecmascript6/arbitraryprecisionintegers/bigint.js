/**
 * @fileOverview 基本データ型BigInt調査用モジュール
 */

const getMaxInteger64 = () => 2n ** (64n - 1n) - 1n;

const toBigInt = n => BigInt(n);

const makeBigIntArray = ({array, BIArray}) => {
    const ba = new BIArray(array.length);
    array.forEach((value, index) => ba[index] = toBigInt(value));
    return ba;
};

const getBigInt64Array = array => makeBigIntArray({
    array,
    BIArray: BigInt64Array
});

const getBigUint64Array = array => makeBigIntArray({
    array,
    BIArray: BigUint64Array
});

const toBigInt64Array = ({array, unsigned = false}) => {
    if (!unsigned) {
        return getBigInt64Array(array);
    } else {
        return getBigUint64Array(array);
    }
};

// 64bitの範囲で計算を行いたい場合であっても、BigInt同士の計算では
// 64bitで扱える数値の範囲を超えることができてしまう。しかし
// BigInt.asIntNやBigInt.asUintNを適用することで64bitの範囲に
// 計算結果を収めることができる。
const asBigInt = ({bit, value, unsigned = false}) => {
    if (!unsigned) {
        return BigInt.asIntN(bit, value);
    } else {
        return BigInt.asUintN(bit, value);
    }
};

const runTest = () => {
    const n = toBigInt(Number.MAX_SAFE_INTEGER);
    console.log(n, typeof n);
    const x = 10;
    const m = toBigInt(x);
    console.log(`Number.MAX_SAFE_INTEGER + ${x} = ${Number.MAX_SAFE_INTEGER + x} (精度が失われ計算結果がおかしくなる)`);
    console.log(`BigInt converted: Number.MAX_SAFE_INTEGER + ${x} = ${n + m}`);
    
    const max = getMaxInteger64();
    const value = max + 1n;
    const bit = 64;
    console.log(value, asBigInt({
        bit, 
        value
    }));
    console.log(value, asBigInt({
        bit, 
        value,
        unsigned: true
    }));
    
    const array = [1, 10, 100, 1000, Number.MAX_SAFE_INTEGER];
    console.log(toBigInt64Array({array, unsigned: false}));
    console.log(toBigInt64Array({array, unsigned: true}));
};

const myBigInt = {
    toBigInt,
    asBigInt,
    toBigInt64Array,
    test: {
        runTest
    }
};

export default myBigInt;
