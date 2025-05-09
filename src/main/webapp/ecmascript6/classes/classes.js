(function(goma){
    "use strict";
    
    /**
     * クラス宣言はfunction式と同様に巻き上げされないので
     * 宣言前に参照するとエラーになる。
     */
    //let pt = new Point(1, 1);
    
    class Point{
        constructor(x = 0, y = 0){
            this.x = x;
            this.y = y;
        }
        
        get coords(){
            return [this.x, this.y];
        }
        
        /**
         * Object.toStringと同様，文字列を要求された際に自動で呼び出される。
         */
        toString(){
            return this.coords.toString();
        }
        
        calcDistance(point){
            const deltaX = this.x - point.coords[0]; 
            const deltaY = this.y - point.coords[1]; 
            return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
        }
        
        static getDistance(p1, p2){
            /**
             * staticメソッドの中でstaticでないメンバを参照してもエラーにならない。
             * ただし値はundefinedになっている。
             */
            goma.log(this.coords);
            
            return p1.calcDistance(p2);
        }
    }
    
    class Point3D extends Point{
        /**
         * NaNやnullが渡された時は引数のデフォルト値が使われない。
         * undefinedが渡された時は引数のデフォルト値が使われる。
         */
        constructor(x = 0, y = 0, z = 0){
            /**
             * super.constructorと書くとthisが未定義だというエラーが発生する。
             */
            super(x, y);
            this.z = z;
        }
        
        /**
         * コンストラクタのオーバーロードはできない。というのもECMAScriptにおける
         * クラスは関数の特殊な形でしかないからだ。ECMAScriptの関数はオーバーロード
         * できない。従ってクラスもオーバーロードできない。
         * またRest parameterはデフォルト値を指定することができない。
         */
        //constructor(...coords){
        //    this.constructor(coords[0], coords[1], coords[2]);
        //}
        
        /**
         * スーパークラスのアクセッサメソッドをオーバーライドする。
         */
        get coords(){
            let cs = super.coords;
            cs.push(this.z);
            return cs;
        }
    }
    
    /**
     * インターフェースのようなものを定義している。
     * 各メソッド内ではスーパークラスのメンバにアクセスすることができる。
     * スーパークラスの別名(ここではBase)を介してstaticメソッドに
     * アクセスすることもできる。
     */
    const Sail = Base => class extends Base {
        sail() {
            return this.name + Base.getVersion() + "Sail::sailing!";
        }
    };
    
    const Fly = Base => class extends Base {
        fly() {
            return this.decoratedName + "Fly::flying!";
        }
    };
    
    class Plane {
        /**
         * フィールドを定義することはできない。
         * シンタックスエラーになる。
         */
        //let _name = "sample";
        
        constructor(name) {
            this.name = name;
        }
        
        get decoratedName() {
            return "***" + this.name + "***";
        }
        
        static getVersion() {
            return "1.0";
        }
        
        cruise() {
            return "Plane::cruising!";
        }
    }
    
    /**
     * Java:
     * class X extends Y implements A, B 
     * 
     * ECMAScript6:
     * class X extends A(B(Y))
     */
    class SeaPlane extends Sail(Fly(Plane)) {
        constructor(name){
            super(name);
        }
        
        cruise() {
            /**
             * thisキーワードが無いとReferenceErrorになる。
             * このクラスが該当するメソッドを実装していたとしてもエラーになる。
             * super.cruise()をthis.cruise()と書いてしまうと
             * 「too much recursion」と通知されエラーになる。
             */
            return [this.sail(), this.fly(), super.cruise()].join(" ");
        }
        
        toString() {
            return this.name + " -> " + this.cruise();
        }
    }
    
    const scripts = [
        g => {
            const base = ".class-practice-container ";
            const resultArea = g.select(base + ".result-area");
            
            let points = [];
            
            g.clickListener(g.select(base + ".append-info"), e => {
                const x = g.rand(10), y = g.rand(10);
                const p = new Point(x, y);
                
                g.log(p.coords);
                g.println(resultArea, p);
                
                points.push(p);
            });
            
            g.clickListener(g.select(base + ".clear-info"), e => {
                g.clear(resultArea);
                points = [];
            });
            
            g.clickListener(g.select(".distance-info"), e => {
                if(points.length <= 1){
                    return;
                }
                
                let distance = 0;
                /**
                 * constで宣言された定数もletで宣言された変数と同様に
                 * ブロックスコープを持つ。
                 */
                const startP = points[0];
                const lastP = points[points.length - 1];
                points.reduce((p1, p2) => {
                    distance +=  p1.calcDistance(p2);
                    return p2;
                });
                
                g.println(resultArea, "合計距離:" + distance);
                g.println(resultArea, "始点から終点の直線距離:" + Point.getDistance(startP, lastP));
            });
        },
        g => {
            /**
             * constとletは同時に指定できない。
             */
            const container = ".class-extends-container ";
            
            const resultArea = g.select(container + ".result-area");
            
            const displayCoords = e => {
                const inputCoords = g.values(g.selectAll(container + ".extends-coords"), parseInt);
                const point3d = new Point3D(...inputCoords);
                g.println(resultArea, point3d.coords);
            };
            
            const clearResult = e => {
                g.clear(resultArea);
            };
            
            g.clickListener(g.select(container + ".display-extends-coords"), displayCoords);
            g.clickListener(g.select(container + ".clear-extends-result"), clearResult);
        },
        g => {
            const container = ".class-mixin-container ";
            const resultArea = g.select(container + ".result-area");
            
            const diplayResult = e => {
                const seaPlane = new SeaPlane("Sample plane");
                g.println(resultArea, seaPlane);
            };
            
            const clearResult = e => {
                g.clear(resultArea);
            };
            
            g.clickListener(g.select(container + ".display-mixin-result"), diplayResult);
            g.clickListener(g.select(container + ".clear-mixin-result"), clearResult);
        },
        g => {
            const base = ".inspection-new-target ",
                resultArea = g.select(base + ".result-area"),
                targetTypes = g.selectAll(base + ".new-target-type-selection input[name='new-target-type']"),
                withNewOp = g.select(base + ".with-new-operator"),
                runner = g.select(base + ".display-result"),
                clearer = g.select(base + ".clear-result");
            
            const getNewTarget = target => target || {};
            
            function SampleFunc() {
                return getNewTarget(new.target);
            }
            
            class BaseSample {
                constructor() {
                    g.log(new.target);
                    this.targetName = getNewTarget(new.target).name; 
                }
                
                get name() {
                    /**
                     * constructor関数以外の場所ではnew.targetはundefinedになっている。
                     */
                    //g.log(new.target);
                    //return getNewTarget(new.target).name;
                    return this.targetName;
                }
            }
            
            class SubSample extends BaseSample {
                /**
                 * 継承した場合new.targetの値はサブクラスを示す値になる。
                 */
                constructor() {
                    super();
                }
            }
            
            /**
             * アロー関数はnew演算子と合わせて呼び出したらエラーになるので
             * new.targetの値を確認することができない。
             * new演算子と合わせずに呼び出した時はundefinedである。
             */
            const SampleArrowFunc = () => getNewTarget(new.target);
            
            const newTargets = {
                function_sentence: SampleFunc,
                class_no_inheritance: BaseSample,
                class_with_inheritance: SubSample,
                arrow_function: SampleArrowFunc
            };
            
            const getSelectedTargetType = () => g.getSelectedValue(targetTypes);
            
            g.clickListener(runner, () => {
                const targetType = getSelectedTargetType(),
                    Target = newTargets[targetType];
                
                let result;
                try {
                    let target;
                    if (withNewOp.checked) {
                        target = new Target();
                    } else {
                        target = Target();
                    }
                    result = target.name;
                } catch(err) {
                    result = err.message;
                }
                
                g.println(resultArea, result);
            });
            
            g.clickListener(clearer, () => {
                g.clear(resultArea);
            });
        },
        g => {
            const base = ".override-constructor ",
                resultArea = g.select(base + ".result-area"),
                clearer = g.select(base + ".clear-result"),
                runner = g.select(base + ".display-result");
                
            class Parent {
                constructor (value) {
                    this.value = value;
                }
                
                add (v) {
                    return this.value + v;
                }
                
                get version() {
                    return 1;
                }
            };
            
            class ChildNoOverride extends Parent {
                /**
                 * スーパークラスのコンストラクタ関数をオーバーライドしない。
                 * この場合このクラスのインスタンス生成時もスーパークラスの
                 * コンストラクタが使用される。
                 */
            }
            
            class ChildWithOverride extends Parent {
                constructor (value) {
                    /**
                     * super()を書かなかったりスーパークラスのコンストラクタ呼び出しを
                     * <pre>
                     * super.constructor(value);
                     * </pre>
                     * と書いてしまうと，スーパークラスのメソッド呼び出した時点で
                     * エラーになる。呼ばれたメソッド内でthisを参照しているかどうかは
                     * 関係無い。
                     */
                    super(value);
                    this.value = String(value);
                }
                
                get version() {
                    return super.version + ".B";
                }
            }
            
            runner.addEventListener("click", () => {
                const param = 1;
                const result = [];
                
                try{
                    const o1 = new ChildNoOverride(param);
                    result.push("ChildNoOverride result ... " + o1.add(param));
                    result.push("ChildNoOverride version ... " + o1.version);
                    const o2 = new ChildWithOverride(param);
                    result.push("ChildWithOverride result ... " + o2.add(param));
                    result.push("ChildWithOverride version ... " + o2.version);
                } catch (err) {
                    result.push(err.message);
                }
                
                g.println(resultArea, result.join("<br />"));
            });
            
            clearer.addEventListener("click", () => g.clear(resultArea));
        }
    ];
    
    goma.run(scripts, {
        reject: err => {
            alert(err);
            goma.error(err);
        }
    });
}(window.goma));
