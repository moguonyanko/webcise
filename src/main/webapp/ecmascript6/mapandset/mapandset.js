((goma => {
    "use strict";
    
    const g = goma;
    
    class SampleValue {
        constructor(value) {
            this.value = value;
        }
        
        toString() {
            return this.value.toString();
        }
    }
    
    class InitialValues {
        constructor() {
            /**
             * 様々な型のオブジェクトを同じSetやMapに登録するのは好ましくないが
             * ここでは動作確認のため登録している。
             */
            this.values = [
                new SampleValue("サンプルオブジェクト"), 
                1, 
                false, 
                "サンプル文字列",
                () => 1, 
                new Date()
            ];
        }
        
        [Symbol.iterator]() {
            let current = 0;
            
            return {
                next: () => {
                    let value = this.values[current];
                    let done = this.values.length < ++current;
                    
                    return {done, value};
                }
            };            
        }
    }
    
    const setActions = {
        "add": (set, value) => {
            set.add(value);
        },
        "delete": (set, value) => {
            set.delete(value);
        },
        "values": (set) => {
            const setIter =  set.values();
            return [...setIter];
        },
        "clear": (set) => {
            set.clear();
        }
    };
    
    class SampleKey{
        constructor(key) {
            this.key = key;
        }
        
        toString() {
            return this.key;
        }
        
        /**
         * equalsを実装していてもMapの値取得には全く影響を与えない。
         * ===演算子で等しいと見なされるキーをMapに与えた時のみ値取得に成功する。
         */
        equals(other) {
            if(other instanceof SampleKey){
                return this.key === other.key;
            }else{
                return false;
            }
        }
    }
    
    class MapAction{
        constructor(key){
            this.key = key;
        }
        
        setValue(map, value) {
            map.set(this.key, value);
        }
        
        /**
         * this.keyと等価なキーを外部から与えて値が取得できるかを
         * テストするためのメソッドである。
         */
        getValue(map, otherKey) {
            return map.get(otherKey);
        }
        
        toString() {
            /**
             * Symbolは文字列連結で暗黙的にtoStringが呼び出されて文字列に変換されない。
             * 明示的にtoStringを呼び出さないとエラーになる。
             */
            return "キー " + this.key.toString() + " で値を取得します。";
        }
    }
    
    /**
     * 今のところどのタイプのキーを用いる時でも常に同じ値を保存する。
     */
    const SAMPLE_MAP_VALUE = "値が取得できました！";
    
    const mapKeyFactory = {
        "string": () => "sample string",
        "number": () => 1,
        "boolean": () => true,
        "function": () => () => 1,
        "nan": () => NaN,
        /**
         * () => {} と記述するとブロックを持つArrow functionと区別が付かなくなる。
         * そのためオブジェクトを返すArrow functionを記述したい時は
         *  () => { return {}; } のように明示的にオブジェクトをreturnしなければ
         * ならない。
         */
        "object": () => { return { toString: () => "object literal" }; },
        "class": () => new SampleKey("sample key"),
        "symbol": () => Symbol("sample symbol"),
        /**
         * Global symbolはSymbol生成時に渡した引数が等しいSymbol同士であれば
         * ===演算子で比較した際にtrueを返す。つまり等しい引数で生成された
         * Global symbolはSetに複数追加することができない。
         */
        "globalsymbol": () => Symbol.for("sample global symbol")
    };
    
    const mapValues = {
        "string": "by string",
        "number": "by number",
        "boolean": "by boolean",
        "function": "by function",
        "nan": "by NaN",
        "object": "by object",
        "class": "by class",
        "symbol": "by symbol",
        "globalsymbol": "by global symbol"
    };
    
    let mapActions = {};
    
    const initMapActions = types => {
        for(let type of types){
            mapActions[type] = new MapAction(mapKeyFactory[type]());
        }
    };
    
    /**
     * 引数の文字列から適当なハッシュ値を計算して返す。
     */
    const hashOf = value => {
        if(typeof value !== "string"){
            value = (value || "").toString();
        }
        
        const hash = Array.from(value)
                    .map((c, idx) => value.codePointAt(idx))
                    .reduce((a, b) => a + b);
            
        return hash * 31;
    };
    
    /**
     * 等値性を表現する機能のインターフェースです。
     * デフォルトのequalsやhashを実装しています。
     */
    const Equatable = Base => class extends Base {
        equals(base) {
            if(base instanceof Base){
                return this.id === base.id;
            }else{
                return false;
            }
        }

        hashCode() {
            return hashOf(this.id);
        }
        
        /**
         * オブジェクトごとに適切なIDを返すようにオーバーライドする。
         */
        get id() {
            return new String("");
        }
    };
    
    class BaseKey {}
    
    /**
     * DictionaryKeyをDictionaryの内部クラスにはできない。
     * ECMAScript6では内部クラスは使用できない。
     */
    class DictionaryKey extends Equatable(BaseKey) {
        constructor(key) {
            super();
            this.key = key;
        }
        
        toString() {
            return this.key.toString();
        }
        
        get id() {
            return this.key;
        }
    }
    
    /**
     * @todo
     * キーがequalsとhashCodeを実装していることを保証するにはどうするか？
     */
    class Dictionary {
        constructor(keyValues) {
            /**
             * entryMapとkeySetMapは本当はprivateなフィールドにしたい。
             * privateなフィールドを定義する方法はECMAScript6には存在しない。
             * そもそもフィールドを定義する方法が存在しない。
             */
            if (g.isIterable(keyValues)) {
                this.entryMap = new Map(keyValues);
                this.keySetMap = new Map();
                /* 各配列の2番目の要素は値だがここでは必要無いので無視する。 */
                for (let [key, ] of keyValues) {
                    const hash = key.hashCode();
                    if (!this.keySetMap.has(hash)) {
                        this.keySetMap.set(hash, new Set());
                    }
                    this.keySetMap.get(hash).add(key);
                }
            } else {
                this.entryMap = new Map();
                this.keySetMap = new Map();
            }
        }
        
        set(k, v) {
            /**
             * 引数のキーをハッシュ値をキーにしたマップで保持しておく。
             */
            const hash = k.hashCode();
            if(!this.keySetMap.has(hash)){
                this.keySetMap.set(hash, new Set());
            }
            this.keySetMap.get(hash).add(k);
            
            /**
             * 登録済みのキーに === で等しいと見なされるキーが無ければ
             * 新しいエントリが追加される。既存のエントリを置き換えたいなら，
             * 既存のエントリのキーに置き換えて登録する。
             */
            let savedKey;
            for (let targetKey of this.entryMap.keys()) {
                if(targetKey.equals(k)){
                    savedKey = targetKey;
                    break;
                }
            }
            this.entryMap.set((savedKey || k), v);
        }
        
        get(k) {
            const realKey = this._getRealKey(k);
            
            if(realKey){
                return this.entryMap.get(realKey);
            }else{
                return null;
            }
        }
        
        /**
         * メソッドは巻き上げされるのでこれより上のコードで参照できる。
         */
        _getRealKey(k) {
            const targetKeys = this.keySetMap.get(k.hashCode()) || new Set();
            
            for (let targetKey of targetKeys) {
                if(targetKey.equals(k)){
                    return targetKey;
                }
            }
            
            return null;
        }
        
        keys() {
            return this.entryMap.keys();
        }
        
        values() {
            return this.entryMap.values();
        }
        
        entries() {
            return this.entryMap.entries();
        }
        
        [Symbol.iterator]() {
            return this.entries();
        }
        
        has(k) {
            const realKey = this._getRealKey(k);
            return this.entryMap.has(realKey);
        }
        
        /**
         * メソッド名にキーワードを使用しても問題無い。
         * 
         * 好ましいことではないがハッシュ値は異なるオブジェクトでたまたま
         * 等しくなる可能性があるため，同じハッシュ値に紐付くキーが
         * 存在しなくなった時でないとkeySetMapのエントリを削除することができない。
         * 結果としてdelete後のkeySetMapとentryMapのサイズは必ずしも等しくならない。
         */
        delete(k) {
            if(this.has(k)){
                const realKey = this._getRealKey(k);
                const deletedFromKeySet = this.keySetMap.get(k.hashCode()).delete(realKey);
                /**
                 * ハッシュ値に関連付けられたキーが無くなった時にそのハッシュ値の
                 * エントリをkeySetMapからdeleteする。
                 */
                if(this.keySetMap.get(k.hashCode()).size === 0){
                   this.keySetMap.delete(k.hashCode()); 
                }
                const deletedFromEntry = this.entryMap.delete(realKey);
                
                if (deletedFromKeySet && deletedFromEntry) {
                    /**
                     * keySetMapとentryMapの両方からの削除が成功した時だけ
                     * 削除成功としないとキーの不整合が生じる。
                     */
                    return true;
                } else {
                    /**
                     * エントリの削除に失敗した時は元の状態に戻るように
                     * エントリの再登録を行う。ここに到達した時点でkeySetMapと
                     * entryMapにキーの不整合が生じている可能性があるので
                     * 例外をスローするのが正しいかもしれない。
                     */
                    this.set(k, this.get(k));
                    return false;
                }
            } else {
                /**
                 * 引数のキーに紐付くエントリが存在しない場合は削除失敗。
                 */
                return false;
            }
        }
        
        clear() {
            /**
             * constructorは直接呼び出すとエラーになる。
             */
            //this.constructor();
            this.entryMap = new Map();
            this.keySetMap = new Map();
        }
        
        get size() {
            return this.entryMap.size;
        }
        
        forEach(callback) {
            /**
             * Map.prototype.forEachに従い「値，キー，Dictionary」の順で
             * callbackに渡す。 
             */
            [...this].forEach(keyValue => callback(keyValue[1], keyValue[0], this));
        }
    }
    
    class KeyUser {
        constructor(name, age) {
            this.name = name;
            this.age = age;
        }
        
        equals(other) {
            if(other instanceof KeyUser){
                return this.name === other.name && 
                        this.age === other.age;
            }else{
                return false;
            }
        }
        
        hashCode() {
            return hashOf(this.name) + this.age;
        }
        
        toString() {
            return `My name is ${this.name}. I am ${this.age} years old.`;
        }
        
        get id() {
            return `${this.name.toUpperCase()}@${this.hashCode()}`;
        }
    }
    
    const initializers = [
        g => {
            const resultArea = g.select(".set-container .result-area");
            
            /**
             * Setのコンストラクタはiterableなオブジェクトを引数に取れる。
             * iterableなオブジェクトとはIteration protocolsを実装した
             * オブジェクトを指す。
             */
            const set = new Set(new InitialValues());
            
            const ctrls = g.selectAll(".control-set .control-set-button");
            const input = g.select(".control-set .set-value");
            
            g.forEach(ctrls, ctrl => {
                g.clickListener(ctrl, e => {
                    const actionName = ctrl.value;
                    const setAction = setActions[actionName];
                    const result = setAction(set, input.value);
                    /* 空文字は出力しない。 */
                    if(result && result.toString()){
                        g.println(resultArea, result.toString());
                    }
                });
            });
            
            g.clickListener(g.select(".clear-result-area"), e => {
                g.clear(resultArea);
            });
            
            g.clickListener(g.select(".control-set .change-array"), e => {
                const excludeCheck = g.select(".control-set .exclude-text-value");
                let array;
                if(excludeCheck.checked){
                    const exSet = new Set(input.value.split(","));
                    array = [];
                    /**
                     * SetはforEachを実装している。
                     */
                    set.forEach(v => {
                        if(!exSet.has(v)){
                            array.push(v);
                        }
                    });
                    /**
                     * Chrome49はリスト内包表記に対応していないのでシンタックスエラーになる。
                     * Firefox45では正常に動作する。
                     */
                    //array = [v for (v of set) if (!exSet.has(v))];
                }else{
                    array = Array.from(set);
                }
                g.println(resultArea, array.toString());
            });
        },
        g => {
            const resultArea = g.select(".map-container .result-area");
            const baseClass = ".control-map ";
            const typeEles = g.selectAll(baseClass + ".map-key-conatner input");
            
            let map = new Map();
            
            const types = g.values(typeEles);
            initMapActions(types);
            
            const getType = () => {
                const typeEle = g.findFirst(typeEles, t => t.checked);
                const type = typeEle.value;
                return type;
            };
            
            g.clickListener(g.select(baseClass + ".set-map-value"), e => {
                const type = getType();
                const action = mapActions[type];
                action.setValue(map, mapValues[type]);
                g.println(resultArea, action.toString());
            });
            
            g.clickListener(g.select(baseClass + ".get-map-value"), e => {
                const type = getType();
                const action = mapActions[type];
                const value = action.getValue(map, mapKeyFactory[type]());
                g.println(resultArea, value.toString());
            });
            
            g.clickListener(g.select(".map-container .clear-result-area"), e => {
                g.clear(resultArea);
            });
            
            g.clickListener(g.select(baseClass + ".view-map-keys"), e => {
                /**
                 * Map.prototype.keysが返すオブジェクトはIteratorなので
                 * 配列のメソッドを適用する場合はArray.fromを介して行う必要がある。
                 * Map.prototype.valuesについても同様である。
                 */
                g.forEach(Array.from(map.keys()), key => g.println(resultArea, key.toString()));
            });
            
            g.clickListener(g.select(baseClass + ".view-map-values"), e => {
                g.forEach(Array.from(map.values()), value => g.println(resultArea, value.toString()));
            });
            
            g.clickListener(g.select(baseClass + ".view-map-keyvalues"), e => {
                /**
                 * Mapはiterableなのでfor...ofで反復できる。Map.prototype.entriesを
                 * 呼び出した時も同じ結果になる。
                 */
                for(let [key, value] of map){
                    g.println(resultArea, "key=" + key.toString() + ",value=" + value.toString());
                }
            });
            
            g.clickListener(g.select(baseClass + ".upper-map-values"), e => {
                /**
                 * MapはforEachを実装しているが「値，キー」の順序で引数が渡されてくる。
                 * for...ofによる反復とは異なる。
                 */
                map.forEach((value, key) => {
                    if(g.strp(value)){
                        map.set(key, value.toUpperCase());
                    }
                });
            });
            
            g.clickListener(g.select(baseClass + ".array-to-map"), e => {
                const size = map.size || 10;
                const array = [];
                for(let i = 0; i < size; i++){
                    array.push(null);
                }
                const newKeyValues = array.map((e, idx) => {
                    return ["key" + idx, "value" + idx];
                });
                /**
                 * iterableなオブジェクトからMapを生成することができる。
                 */
                map = new Map(newKeyValues);
            });
            
            g.clickListener(g.select(baseClass + ".clear-map-values"), e => {
                map.clear();
            });
            
            g.clickListener(g.select(baseClass + ".delete-map-value"), e => {
                const type = getType();
                const key = mapKeyFactory[type]();
                /**
                 * ===演算子で等しいと見なされるキーを渡せない場合は値をを削除する
                 * ことができない。Map.prototype.deleteが返す真偽値はMap.prototype.hasが
                 * 返す値と同じである。
                 */
                const result = map.delete(key);
                g.println(resultArea, "値が削除できたか？ ... " + result.toString());
            });
        },
        g => {
            const c = ".weakset-container ";
            const resultArea = g.select(c + ".result-area");
            
            let wsValues = {
                values: [
                    {
                        name: "hogehoge",
                        toString: function(){
                            return this.name;
                        }
                    }, 
                    function sampleFunc(){}, 
                    new Date()
                    /**
                     * Symbolは基本データ型同様nullにならないのでWeakSetに追加できない。
                     */
//                    ,Symbol("symbol foo"),
//                    Symbol("symbol foo"),
//                    Symbol.for("global symbol foo"),
//                    Symbol.for("global symbol foo")
                ],
                current: 0,
                [Symbol.iterator]: () => {
                    next: () => {
                        let value = wsValues.values[wsValues.current];
                        let done = wsValues.values.length < ++wsValues.current;

                        return {done, value};
                    }
                },
                reset: () => {
                    wsValues.current = 0;
                }
            };
            
            const ws = new WeakSet(wsValues.values);
            /**
             * @todo
             * オブジェクトリテラルのiteration protocolsが参照されないため
             * WeakSetに値を追加できない。
             */
            //const ws = new WeakSet(wsValues);
            const copyValues = Object.assign({}, {
                /**
                 * Array.fromで生成された配列を元の配列と===演算子で比較してもtrueにならない。
                 */
                values: Array.from(wsValues.values)
            });
            g.clickListener(g.select(c + ".view-weakset-values"), e => {
                /**
                 * WeakSetには値を反復したり直接得たりするためのAPIが存在しない。
                 * 現在のサイズを得るプロパティも無い。少なくともFirefox45のWeakSetに
                 * lengthプロパティは存在しない。
                 */
                for(let v of copyValues.values){
                    const result = "Is exist " + v.toString() + "? ..." + ws.has(v);
                    g.println(resultArea, result);
                }
            });
            
            g.clickListener(g.select(c + ".clear-result-area"), e => {
                g.clear(resultArea);
            });
            
            g.clickListener(g.select(c + ".delete-weakset-values"), e => {
                if(wsValues && "values" in wsValues){
                    /**
                     * @todo
                     * WeakSetの値がGCの対象になるような操作を行っても
                     * WeakSetから値が削除されない。削除される条件が不明。
                     */
                    wsValues.values = null;
                    delete wsValues.values;
                    wsValues = null;
                }
            });
        },
        g => {
            const base = ".weakmap-container ",
                  resultArea = g.select(base + ".result-area");
            
            class SampleKey{
                constructor(key){
                    this.key = key;
                }
                
                toString(){
                    return "sample key is " + this.key.toString();
                }
            }
            
            let keyValues = {
                "object": {
                    "key": {toString: () => "key object"},
                    "value": "by object"
                },
                "function": {
                    "key": () => 1,
                    "value": "by function"
                },
                "date": {
                    "key": new Date(),
                    "value": "by date"
                },
                "class": {
                    "key": new SampleKey("key class"),
                    "value": "by class"
                }
            };
            
            const kvs = [];
            for(let type in keyValues){
                kvs.push([keyValues[type].key, keyValues[type].value]);
            }
            
            let wm = new WeakMap(kvs);
            
            /**
             * Symbolはnullにならないのでキーにできない。
             */
            //wm.set(Symbol.for("key symbol"), "by symbol");
            
            g.clickListener(g.select(base + ".view-weakmap-values"), e => {
                for(let type in keyValues){
                    const key = keyValues[type].key;
                    g.println(resultArea, key.toString() + " = " + wm.get(key));
                }
            });
            
            g.clickListener(g.select(base + ".delete-weakmap-keys"), e => {
                for(let type in keyValues){
                    const key = keyValues[type].key;
                    const result = wm.delete(key);
                    g.println(resultArea, "Succeeded in deletion value by " + key.toString() + " ... " + result);
                }
            });
            
            g.clickListener(g.select(base + ".test-weakmap-gc"), e => {
                /**
                 * @todo
                 * WeakMapのキーを保持していたオブジェクトを別のオブジェクトに
                 * 置き換えてもWeakMapのキーと値は削除されない。削除される条件が不明。
                 */
                keyValues = Object.assign({}, keyValues);
                g.log(keyValues);
            });
            
            g.clickListener(g.select(base + ".clear-result-area"), e => {
                g.clear(resultArea);
            });
        },
        g => {
            const base = ".equality-test-container ",
                resultArea = g.select(base + ".result-area");
            
            /**
             * サンプルユーザー追加
             */
            const users = [
                new KeyUser("foo", 20), 
                new KeyUser("bar", 30), 
                new KeyUser("baz", 40)
            ];
            const dict = new Dictionary(users.map(u => [u, u.toString()]));
            
            g.clickListener(g.select(base + ".set-equality-test-entry"), e => {
                const keyEle = g.select(base + ".equality-test-key"),
                    valueEle = g.select(base + ".equality-test-value");
                dict.set(new DictionaryKey(keyEle.value), valueEle.value);
            });
            
            g.clickListener(g.select(base + ".get-equality-test-entry"), e => {
                const keyEle = g.select(base + ".equality-test-key");
                const value = dict.get(new DictionaryKey(keyEle.value));
                g.println(resultArea, value);
            });
            
            g.clickListener(g.select(base + ".clear-result-area"), e => {
                g.clear(resultArea);
            });
            
            const createKeyUser = () => {
                const keyUserEles = g.refs("equality-test-key-users");
                const keyUserInfo = g.selected(keyUserEles);
                const info = keyUserInfo.split("_");
                const keyUser = new KeyUser(info[0], parseInt(info[1]));
                
                return keyUser;
            };
            
            g.clickListener(g.select(base + ".equality-test-get-by-user"), e => {
                const keyUser = createKeyUser();
                /**
                 * 入力値やパラメータからキーとなるオブジェクトを生成し，
                 * そのオブジェクトを用いて既存のMapから値を得る。
                 * これがECMAScriptのMapに本来実現して欲しい動作である。
                 */
                const value = dict.get(keyUser);
                g.println(resultArea, value);
            });
            
            g.clickListener(g.select(base + ".dump-equality-test-entries"), e => {
                dict.forEach((value, key, dict) => {
                    g.println(resultArea, `key=${key.id}, value=${value}`);
                    g.log(dict);
                });
            });
            
            g.clickListener(g.select(base + ".equality-test-delete-by-user"), e => {
                const keyUser = createKeyUser();
                const deleted = dict.delete(keyUser);
                g.println(resultArea, `Is value deleted? ... ${deleted}`);
            });
            
            g.clickListener(g.select(base + ".equality-test-clear-by-user"), () => {
                dict.clear();
                g.println(resultArea, `Is dictionary clear? ... ${dict.size === 0}`);
            });
            
            g.clickListener(g.select(base + ".equality-test-add-by-user"), () => {
                const keyUser = createKeyUser();
                dict.set(keyUser, keyUser.toString());
            });
        },
        g => {
            const root = "/webcise/";
            const base = ".json-interoperation ";
            const resultArea = g.select(base + ".result-area");
            
            const printJSON = (json, f = v => v) => {
                g.log(JSON.stringify(json));
                /**
				 * 配列はJSONとして有効でありIteratableでもあるが
				 * Mapコンストラクタの引数にはIteratableかつ配列「のような」
				 * オブジェクトを渡さなければエラーになる。
				 * 即ち配列をそのまま渡してMapオブジェクトを得ることはできない。
				 * もちろんIteratableの要件を満たしていないJSONオブジェクトを
				 * Mapコンストラクタに渡してもエラーになる。
				 */
				const array = g.jsonToArray(json, key => f(json[key]));
                const map = new Map(array);
                map.forEach((v, k) => g.println(resultArea, [k, v].join("=")));
            };
            
            g.clickListener(g.select(base + ".json-checker-xhr"), () => {
                /**
                 * Promiseを使うことで「どういう条件の時に処理が成功とされるのか」と
                 * 「成功した時に結果をどう扱うのか」を分離できる。つまり関心の分離を
                 * 促進しやすくなる。
                 */
                const promise = new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open("GET", root + "shopinfo");
                    xhr.responseType = "json";
                    xhr.onreadystatechange = () => {
                        if(xhr.readyState === XMLHttpRequest.DONE){
                            if (xhr.status >= 400) {
                                reject(xhr.statusText);
                                return;
                            }
                            
                            const type = xhr.getResponseHeader("Content-Type");
                            if (type.match(new RegExp(xhr.responseType))) {
                                resolve(xhr.response);
                            } else {
                                reject("Invalid response type:" + type);
                            }
                        }
                    };
                    xhr.send(null);
                });
                
                promise.then(json => {
					printJSON(json, Object.values);
				}).catch(message => {
                    g.println(resultArea, message);
                });
            });
            
            const getPort = () => {
                const val = g.select(base + ".json-checker-ws-port").value;
                return parseInt(val);
            };
			
			const getWebSocket = () => {
				/**
				 * Chromeではhttpsを用いて表示されたページ内でwsスキームを使い
				 * WebSocketのリクエストを送信してもエラーにならない。
				 * Firefoxではセキュアな通信ではないとしてエラーになる。
				 */
				const protocol = g.isSSL() ? "wss" : "ws";
				/**
				 * クロスオリジンにするためにlocalhostを指定している。
				 * WebSocketはクロスオリジンでもリクエストできる。 
				 * プロトコルにwsやwss以外を指定するとエラーになる。
				 */
				const host = "localhost";
				const port = getPort();
				const path = root + "shopinfo";
				if (!isNaN(port)) {
					return new WebSocket(protocol + "://" + host + ":" + port + path);
				} else {
					return new WebSocket(protocol + "://" + host + path);
				}
			};
            
            let ws;
            
            g.clickListener(g.select(base + ".json-checker-ws"), () => {
                if(ws){
                    ws.send(null);
                } else {
                    ws = getWebSocket();
                    /**
                     * XMLHttpRequestのように直接JSONオブジェクトを返すことを
                     * 指定してリクエストを行うことは指定できない。
                     * binaryTypeにjsonと指定しても効果は無い。 
                     */
                    ws.onmessage = evt => printJSON(JSON.parse(evt.data), Object.values);
                    ws.onopen = () => ws.send(null);
                    ws.onerror = evt => {
                        g.println(resultArea, evt.message);
                        ws = null;
                    };
                }
            });
            
            g.clickListener(g.select(base + ".json-closer-ws"), () => {
                if(ws){
                   ws.onclose = evt => {
                       ws = null;
                       let msg = evt.code;
                       if (evt.wasClean) {
                           g.println(resultArea, msg);
                       } else {
                           g.println(resultArea, msg + ":" + evt.reason);
                       }
                   };
                   ws.close();
                }
            });
            
            g.clickListener(g.select(base + ".json-clearer"), 
                () => g.clear(resultArea));
				
			g.clickListener(g.select(base + ".json-reader"), () => {
				let url = root + "shopreader?shop=";
				const param = g.select(base + ".json-reader-param").value;
				url += param;
				
				g.ajax(url, {
					resolve: printJSON,
					reject: err => {
						g.println(resultArea, err.message);
					}
				});
			});
			
			g.clickListener(g.select(base + ".json-parser"), () => {
				let url = root + "shopitems?shopname=";
				const param = g.select(base + ".json-parser-param").value;
				url += param;
				
				g.ajax(url, {
					resolve: printJSON,
					reject: err => {
						g.println(resultArea, err.message);
					}
				});
			});
        },
		g => {
			const base = ".map-object-interoperation ", 
				resultArea = g.select(base + ".result-area"),
				runner = g.select(base + ".runner"),
				clearer = g.select(base + ".clearer");
				
			const display = content => g.println(resultArea, content);
				
			const clear = () => g.clear(resultArea);
				
			const obj = {
				"apple" : 100,
				"dict" : {
					100 : "A",
					300 : "C",
					200 : "B",
					toString() {
						return Object.entries(this).toString();
					}
				},
				"taro" : [2, 3, 1, 5, 7]
			};
			
			runner.addEventListener("click", () => {
				/**
				 * Map.entries()の戻り値はMap IteratorだがObject.entries()の
				 * 戻り値はArrayである。何故統一しないのか。
				 * MapコンストラクタはIteratorを引数に取ることができるので
				 * Object.entries()の戻り値をIteratorにしたとしてもMapとの
				 * 相互運用に問題は無かったはずである。
				 */
				const entries = Object.entries(obj);
				const map = new Map(entries);
				display(Array.from(map.entries()));
			});
			
			g.select(base + ".clearer").addEventListener("click", clear);
		}
    ];
    
    goma.run(initializers, {reject: err => console.error(err.toString())});
	
})(window.goma));
