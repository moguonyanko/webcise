((g => {
    "use strict";
    
    /**
     * Arrow function内ではstrictモードであってもthisはundefinedにならない。
     * withが使用できない等といった他のstrictモードの特性は保持している。
     * 
     * 参考:Relation with strict mode
     * https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/Arrow_functions
     */
    g.log(this);
    g.log("window === this -> " + (window === this));
    
    class Person{
        constructor(name, age){
            this.name = name;
            this.age = parseInt(age);
        }
        
        toString(){
            return this.name + ":" + this.age;
        }
    }
    
    const pList = Array.of(
        ["foo", 20], 
        ["bar", 40], 
        ["baz", 30],
        ["hoge", 45], 
        ["poo", 15], 
        ["peko", 30], 
        ["moo", 25], 
        ["don", 50], 
        ["mike", 18], 
        ["joe", 35]
    );
    
    const getPersons = size => {
        return pList.slice(0, size).map(params => new Person(...params));
    };
    
    const forEachPersons = (persons, func) => {
        /**
         * 元のオブジェクトとProxyを同じfor...ofで巡回するためには，
         * Proxyのコンストラクタに渡したオブジェクトがiteratableで
         * なければならない。
         */
        for(let p of persons){
            func(p);
        }        
    };
    
    const funcs = [
        g => {
            const base = ".proxy-container ",
                resultArea = g.select(base + ".result-area");
            
            const handler = {
                get: (persons, prop) => {
                    let p = persons[prop];
                    
                    /**
                     * Symbolのプロパティを避ける処理を行っているのは，
                     * Proxyコンストラクタの引数に配列(=iteratable)を
                     * 渡したことでSymbol.iteratorも渡されてくるからである。
                     * ここではインデックスが渡された時だけ特別な処理を行う。
                     */
                    const isIndex = !g.symp(prop) && !isNaN(parseInt(prop));
                    if(isIndex){
                        return new Person(p.name.toUpperCase(), p.age + 100);
                    }else{
                        /**
                         * 配列のインデックス以外が参照された時はプロパティの値を
                         * そのまま返す。
                         */
                        return p;
                    }
                }
            };
            
            const size = 5;
            const persons = getPersons(size);
            const proxy = new Proxy(persons, handler);
            
            g.clickListener(g.select(base + ".view-objects"), 
                e => forEachPersons(persons, p => g.println(resultArea, p)));
            
            g.clickListener(g.select(base + ".view-objects-proxy"), 
                e => forEachPersons(proxy, p => g.println(resultArea, p)));
            
            g.clickListener(g.select(base + ".clear-result"), e => {
                g.clear(resultArea);
            });
        },
        g => {
            const base = ".reflect-container ",
                resultArea = g.select(base + ".result-area");
                
            const sampleObj = {
                name: "hogehoge",
                age: 50,
                [Symbol("symbol key")]: "symbol",
                [Symbol.for("global symbol key")]: "global symbol",
                [new Date().getTime()]: "now time",
                /**
                 * クラスでなくてもクラスのメソッドと同じ文法でメソッドを定義できる。
                 */
                [{toString(){ return "sample object"; }}]: "object key"
            };
            
            g.clickListener(g.select(base + ".view-objects"), e => {
                for(let key of Reflect.ownKeys(sampleObj)){
                    const value = Reflect.get(sampleObj, key);
                    const result = `key=${key.toString()}, value=${value.toString()}`;
                    g.println(resultArea, result);
                }
            });
            
            g.clickListener(g.select(base + ".clear-result"), e => {
                g.clear(resultArea);
            });
        },
		g => {
			const base = ".reflect-methods-sample ";
			const { runner, clearer, output } = g.getCommonUI(base);
			
			class Person {
				constructor(...args) {
					const [name, age] = args;
					this.name = name;
					this.age = age;
				}
				
				getDecoratedName(prefix, suffix) {
					return prefix + this.name.toUpperCase() + suffix;
				}
				
				toString() {
					const values = Reflect.ownKeys(this).map(key => {
						if (!g.funcp(this[key])) {
							return this[key];
						} else {
							return key;
						}
					});
					
					return values.join(" : ");
				}
			}
			
			const construct = (...args) => {
				console.log(args);
				/**
				 * Reflect.constructの第2引数は配列か配列のようなオブジェクトしか受け取れない。
				 * Reflect.applyの第3引数も同様。
				 * オブジェクトで引数を受け取る関数とは相性が悪いかもしれない。
				 */
				return Reflect.construct(Person, args);
			};
			
			const defineProperty = ({ target, name, attributes = null } = {}) => {
				return Reflect.defineProperty(target, name, attributes);
			};
			
			const deleteProperty = ({ target, name } = {}) => {
				return Reflect.deleteProperty(target, name);
			};
			
			const apply = (fn, context, args) => {
				return Reflect.apply(fn, context, args);
			};
			
			const runTest = () => {
				const nameEle = g.select(base + ".sample-person-name"),
					ageEle =  g.select(base + ".sample-person-age");
				const { name, age } = { name: nameEle.value, age: ageEle.value };
				
				const display = text => Reflect.apply(g.println, null, [output, text]);
				
				const person = construct(name, age);
				
				const propName = "hobby";
				
				const attributes = {
					value : "programming",
					/**
					 * Object.definePropertyと同じくenumerable，configurable，
					 * writableは指定されないと全てデフォルトでfalseになる。
					 * その場合，Reflect.deletePropertyは失敗する。
					 */
					enumerable : true,
					configurable : true,
					writable : true
				};
				
				const defined = defineProperty({
					target: person,
					name: propName,
					attributes
				});
				
				defined ? display(person) : display(`Failed define property ${propName}`);
				
				const deleted = deleteProperty({
					target: person,
					name: propName
				});
				
				deleted ? display(person) : display(`Failed delete property ${propName}`);
				
				const fn = person.getDecoratedName;
				const args = ["+++++", "*****"];
				const result = apply(fn, person, args);
				
				display(result);
			};
			
			runner.addEventListener("click", runTest);
			
			clearer.addEventListener("click", () => g.clear(output));
		},
        g => {
            const Person = class {
                // Reflect.constructで生成した場合もnewを使って生成したのと同じように
                // new.targetでコンストラクタを参照できる。
                // なおclassはnewでインスタンス生成されないとエラーになる。
                // 即ちnew.targetによるnewでインスタンス生成されたかどうかのチェックは
                // classには不要ということである。classのnew.targetは決してundefinedには
                // ならないということでもある。
                constructor({name, age}) {
                    this.name = name;
                    this.age = age;
                    console.log(`new.target: ` + new.target);
                }
                
                toString() {
                    return `${this.name},${this.age}`;
                }
            };
            
            const Student = class extends Person {
                constructor({name, age, score}) {
                    super({name, age});
                    this.score = score;
                }
                
                toString() {
                    return `${super.toString()},${this.score}`;
                }
            };
            
            const DummySubElement = class extends HTMLElement {
                constructor() {
                    super();
                }
                
                toString() {
                    return `TagName: ${super.tagName}`;
                }
            }
            
            const ReflectConstructor = class extends HTMLElement {
                constructor() {
                    super();
                    
                    const template = document.querySelector(".reflect-constructor");
                    const shadow = this.attachShadow({mode: "open"});
                    shadow.appendChild(template.content.cloneNode(true));
                }
                
                dumpPrototype(objects) {
                    objects.map(o => Reflect.getPrototypeOf(o))
                        .forEach(console.log);
                }
                
                createObjects() {
                    const p1 = Reflect.construct(Person, 
                        [{ name: "Taro", age: 58 }]);
                    // 第1引数のPersonコンストラクタが使われてインスタンス生成される。
                    // 第3引数のStudentは無視される。つまりscoreはundefinedになる。
                    const s1 = Reflect.construct(Person, 
                        [{ name: "Jiro", age: 22, score: 100 }], Student);
                    // Studentのコンストラクタが利用されるのでscoreの値も反映される。
                    const s2 = Reflect.construct(Student, 
                        [{ name: "Jiro", age: 22, score: 100 }]);
                    // DummySubElementがcustomElements.defineされていないとエラー。
                    // custom elementとして実際に使われているかどうかは関係無い。
                    const e1 = Reflect.construct(HTMLElement, [], DummySubElement);
                    console.log(`e1 instanceof HTMLElement?: ${e1 instanceof HTMLElement}`);
                    console.log(`e1 instanceof DummySubElement?: ${e1 instanceof DummySubElement}`);
                    
                    const results = [p1, s1, s2, e1];
                    
                    this.dumpPrototype(results);
                    
                    return results;
                }
                
                connectedCallback() {
                    const root = this.shadowRoot;
                    root.addEventListener("click", event => {
                        if (!event.target.classList.contains("target")) {
                            return;
                        }
                        event.stopPropagation();
                        const objs = this.createObjects();
                        root.querySelector(".output").innerHTML = 
                            objs.map(r => r.toString()).join("<br />");
                    });
                }
            };
            
            customElements.define("reflect-constructor", ReflectConstructor);
            customElements.define("dummy-sub-element", DummySubElement);
        }
    ];
    
    g.run(funcs);
})(window.goma));
