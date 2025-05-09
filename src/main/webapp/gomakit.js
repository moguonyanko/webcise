(function (win, doc) {
    "use strict";

    if (typeof win.Gomakit === "function") {
        return;
    }
    
    function noop(){
        /* Does nothing. */
    }
    
    /**
     * この関数をarrow functionで定義するとargumentsが定義されていないため
     * エラーとなる。
     */
    function always() {
        return arguments;
    }

    function printText(ele, txt, override, newline) {
        var prop,
            newLineChar;

        if ("value" in ele) {
            prop = "value";
            newLineChar = "\n";
        } else {
            prop = "innerHTML";
            newLineChar = "<br />";
        }

        if (!newline) {
            newLineChar = "";
        }

        if (override) {
            ele[prop] = txt + newLineChar;
        } else {
            ele[prop] += txt + newLineChar;
        }
    }

    function consoleLog() {
        if (arguments.length > 1) {
            Array.prototype.forEach.call(arguments, function (el) {
                console.log(el);
            });
        } else {
            console.log(arguments[0]);
        }
    }

    function consoleError() {
        if (arguments.length > 1) {
            Array.prototype.forEach.call(arguments, function (el) {
                console.error(el);
            });
        } else {
            console.error(arguments[0]);
        }
    }

    function strp(value) {
        return typeof value === "string";
    }

    function nump(value) {
        return typeof value === "number";
    }

    function StringBuilder(opt_initialValue, opt_sep) {
        this.values = [];
        this.separator = opt_sep || "";
        strp(opt_initialValue) || this.values.push(opt_initialValue);
    }

    StringBuilder.prototype = {
        append: function (value) {
            strp(value) || this.values.push(value);
            return this;
        },
        toString: function () {
            return this.values.join(this.separator);
        }
    };

    function funcp(value) {
        return typeof value === "function";
    }

    function getValueFunc(opts) {
        opts = opts || {};

        if (funcp(opts.getter)) {
            return opts.getter;
        } else {
            return function (ele) {
                return ele.value;
            };
        }
    }

    function freeze(obj, names) {
        if (!names) {
            /**
             * 不変(読み取り専用かつ編集不可)にするプロパティ名の配列が
             * 引数に渡されなかった時は全ての独自プロパティを不変にする。
             */
            Object.freeze(obj);
        } else {
            for (var i = 0, len = names.length; i < len; i++) {
                var name = names[i];

                /* 設定可能でないプロパティは無視する。 */
                if (Object.getOwnPropertyDescriptor(obj, name).configurable) {
                    Object.defineProperty(obj, name, {
                        writable: false,
                        configurable: false
                    });
                }
            }
        }
    }

    function Gomakit() {
        freeze(this);
    }
    
    function GomakitError(reason){
        this.message = reason;
        freeze(this);
    }
    
    GomakitError.prototype = Object.create(Error.prototype);
    
    GomakitError.prototype.toString = function(){
        return "GomakitError:" + this.message;
    };
    
    function getAllKeys(targets) {
        if("Reflect" in win && funcp(win.Reflect.ownKeys)){
            return win.Reflect.ownKeys(targets);
        }else{
            var keys = Object.keys(targets);
            var syms = Object.getOwnPropertySymbols(targets);
            var allKeys = keys.concat(syms);

            return allKeys;
        }
    }
	
	const isIteratable = target => {
		if (!target) {
			return false;
		}
		
		return funcp(target[Symbol.iterator]);
	};
	
	/**
	 * 現状クラスとして定義する必要は無いがクラスとして定義した方が
	 * 今後メソッドを追加しやすくはなる。Arrayを直接継承するより安全で
	 * 拡張性が高いかもしれない。
	 */
	class GomakitArray {
		constructor() {
			//Does nothing.
		}
		
		static create({
			size = 0,
			initial = null,
			values = null,
			debug = false
		} = {}) {
			const accessor = {
				get(target, index) {
					const value = target[index];
					if (debug) {
						console.log(`get value=${value} at index=${index}`);
					}
					return value;
				},
				set(target, index, value) {
					if (debug) {
						console.log(`set value=${value} to index=${index}`);
					}
					target[index] = value;
					/**
					 * ProxyのsetメソッドはBooleanの値を返さないとエラーになる。
					 */
					return true;
				}
			};
			
			/**
			 * Array.isArrayでチェックするとArray以外のIteratableなオブジェクトを
			 * 使って配列を生成できなくなる。
			 */
			const proxyTarget = isIteratable(values) ? 
				Array.of(...values) : 
				Array(size).fill(initial);	
			
			/**
			 * Arrayを継承せずにArrayの全てのメソッドを呼び出せるようにするため
			 * Array.prototypeを含むオブジェクトをProxyに渡す。
			 */
			const handler = Object.assign(Array.prototype, accessor);
			
			return new Proxy(proxyTarget, handler);
		}
	}

    Gomakit.prototype = {
        StringBuilder: StringBuilder,
        log: consoleLog,
        error: consoleError,
        println: function (ele, txt, override) {
            printText(ele, txt, override, true);
        },
        print: printText,
        clear: function (ele) {
            this.print(ele, "", true);
        },
        ref: function (id, doc) {
            return (doc || document).getElementById(id);
        },
        refs: function (name, doc) {
            /**
             * デフォルト値としては配列ではなくNodeListを返すべき。 
             * しかしNodeListのコンストラクタは呼び出せない。
             * 空のNodeListを意図的に返すにはどうすればよいか？
             */
            return (doc || document).getElementsByName(name) || [];
        },
        selectAll: function (selector, doc) {
            return (doc || document).querySelectorAll(selector);
        },
		selall (selector, doc) {
			return this.selectAll(selector, doc);
		},
        select: function (selector, doc) {
            return (doc || document).querySelector(selector);
        },
		sel (selector, doc) {
			return this.select(selector, doc);
		},
        export: function (name, ns) {
            win[name] = ns;
        },
        addListener: function (element, type, fn, capture) {
            element.addEventListener(type, fn, capture);
        },
        removeListener: function (element, type, fn, capture) {
            element.removeEventListener(type, fn, capture);
        },
        prevent: function (evt) {
            evt.preventDefault();
        },
        noop: noop,
        always: always,
        alwaysTrue: function () {
            return true;
        },
        alwaysFalse: function () {
            return false;
        },
        getSelectedValue: function (eles, opts) {
            opts = opts || {};

            var predicate = opts.predicate || function (ele) {
                /**
                 * Element.hasAttributeで要素の論理属性の状態を判別するには
                 * その論理属性が最初から記述されていなければならない。
                 * すなわちinput要素のchecked属性のようにユーザーの操作によって
                 * on, offが変化するような属性には利用できない。
                 * 最初にchecked属性を記述していた要素が常に選択されてしまう。
                 */
                return ele.checked;
            };

            var valGetter = getValueFunc(opts);

            for (var i = 0, len = eles.length; i < len; i++) {
                if (predicate(eles[i])) {
                    return valGetter(eles[i]);
                }
            }

            return null;
        },
        /**
         * @deprecated 
         * 名前から振るまいが分かりづらいので非推奨。
         * getSelectedValueを使用すること。
         */
        selected: function(eles, opts){
            return this.getSelectedValue(eles, opts);
        },
        values: function (eles, opt_modifier) {
            return Array.prototype.map.call(eles, function (el) {
                return funcp(opt_modifier) ? opt_modifier(el.value) : el.value;
            });
        },
        freeze: freeze,
        extend: function (superClass, subClass) {
            subClass.prototype = Object.create(superClass.prototype);
        },
        appendChildAll: function (parentEle, childEles) {
            var fragment = doc.createDocumentFragment();
            Array.prototype.forEach.call(childEles, function (el) {
                fragment.appendChild(el);
            });
            parentEle.appendChild(fragment);
        },
        createWebSocket: function (resourceName, opts) {
            opts = opts || {};

            var protocol = location.protocol === "https:" ? "wss:" : "ws:",
                    host = opts.host || location.host,
                    port = opts.port || 8080;

            return new WebSocket(protocol + "//" + host + ":" + port + "/webcise/" + resourceName);
        },
        clickListener: function (id, listener, opt_cap) {
            var ele = strp(id) ? this.ref(id) : id;
            this.addListener(ele, "click", listener, opt_cap || false);
        },
        loadedHook: function (listener, opt_cap) {
            this.addListener(win, "DOMContentLoaded", listener, opt_cap || false);
        },
        getStyles: function (ele) {
            var style = win.getComputedStyle(ele || doc.documentElement);
            return style;
        },
        makeCSS: function (selector, styles, opt_withTag) {
            var s = new StringBuilder("{", "\n");
            for (var name in styles) {
                s.append(name + ":" + styles[name] + ";");
            }
            s.append("}");

            var css = selector + " " + s.toString();
            if (opt_withTag) {
                css = "<style>" + css + "</style>";
            }

            return css;
        },
        getCSSVariables: function (varName, opt_doc) {
            var value = this.getStyles(opt_doc || doc.documentElement).getPropertyValue(varName);
            return (value || "").trim();
        },
        existsCSSVariables: function (varName, opt_doc) {
            var colorVar = this.getCSSVariables(varName, opt_doc);
            return Boolean(colorVar);
        },
        truthy: function (value) {
            return true;
        },
        falsy: function (value) {
            return false;
        },
        fulfill: function (func, resolve, reject, opt_predicate) {
            var predicate = opt_predicate || this.truthy;

            function executor(resolve, reject) {
                try {
                    var value = func();

                    if (predicate(value)) {
                        resolve(value);
                    } else {
                        reject(new GomakitError(value));
                    }
                } catch (err) {
                    reject(new GomakitError(err.message));
                }
            }

            /**
             * Promiseを使うことでコールバック関数内で発生した例外が
             * 握りつぶされないようにする。
             */
            var promise = new Promise(executor);
            promise.then(resolve).catch(reject);
        },
        makeArray: function (src) {
            return Array.prototype.map.call(src, function (el) {
                return el;
            });
        },
        strp: strp,
        funcp: funcp,
        nump: nump,
        symp: function(target){
            return typeof target === "symbol";
        },
        forEach: function (targets, func) {
            if (Array.isArray(targets)) {
                targets.forEach(func);
            } else {
                var allKeys = getAllKeys(targets);
                for(var i = 0, len = allKeys.length; i < len; i++){
                    func(targets[allKeys[i]]);
                }
            }
        },
        map: function (targets, func) {
            if (Array.isArray(targets)) {
                return targets.map(func);
            } else {
                var allKeys = getAllKeys(targets);
                
                var result = [];
                for(var i = 0, len = allKeys.length; i < len; i++){
                    var value = func(targets[allKeys[i]]);
                    result.push(value);
                }
                
                return result;
            }
        },
        filter: function (targets, predicate) {
            if (Array.isArray(targets)) {
                return targets.filter(predicate);
            } else {
                var allKeys = getAllKeys(targets);
                
                var result = [];
                for(var i = 0, len = allKeys.length; i < len; i++){
                    var testValue = targets[allKeys[i]];
                    if(predicate(testValue)){
                        result.push(testValue);
                    }
                }
                
                return result;
            }
        },
        findFirst: function (targets, predicate) {
            var allKeys = getAllKeys(targets);

            for (var i = 0, len = allKeys.length; i < len; i++) {
                var testValue = targets[allKeys[i]];
                if (predicate(testValue)) {
                    return testValue;
                }
            }

            return null;
        },
        run: function (runners, opts) {
            if (!Array.isArray(runners)) {
                runners = [runners];
            }

            var that = this,
                options = opts || {},
                resolve = funcp(options.resolve) ? options.resolve : this.noop,
                reject = funcp(options.reject) ? options.reject : this.noop,
                predicate = funcp(options.predicate) ? options.predicate : this.truthy;
        
            var promises = runners.map(function (runner) {
                return new Promise(function (resolve, reject) {
                    try {
                        var value = runner(that);
                        if(predicate(value)){
                            resolve(value);
                        }else{
                            reject(new GomakitError(value));
                        }
                    } catch (err) {
                        reject(new GomakitError(err.message));
                    }
                });
            });

            this.loadedHook(function () {
                Promise.all(promises).then(resolve).catch(reject);
            });
        },
        rand: function(seed){
            var n = parseInt(seed);
            var sd = (!isNaN(n) && n > 0) ? n : 1;
            
            return Math.trunc(Math.random() * sd);
        },
        isIterable: function(target){
            if (target) {
                return typeof target[Symbol.iterator] === "function";
            } else {
                return false;
            }
        },
        jsonToArray: function(json, mapper) {
            mapper = mapper || always;
            return Object.keys(json).map(key => [key, mapper(key)]);
        },
        isOpenWebSocket: function(ws) {
            return ws.readyState === WebSocket.OPEN;
        },
        isSSL: function(){
            return location.protocol === "https:";
        },
		/**
		 * @deprecated 
		 * 組み込み関数のfetchを使用すること。
		 */
		fetch(url, {
				method = "GET",
				responseType = "json",
				data = null,
				timeout = 0
			} = {}) {
				
			return new Promise(function (resolve, reject) {
				const xhr = new XMLHttpRequest();
				xhr.open(method, url);
				xhr.responseType = responseType;
				xhr.timeout = timeout;
				xhr.onreadystatechange = () => {
					if (xhr.readyState === XMLHttpRequest.DONE) {
						if (xhr.status < 400) {
							const type = xhr.getResponseHeader("Content-Type");
							/**
							 * @todo
							 * blobをリクエストした時にマッチしない可能性がある。
							 * ContentTypeがimage/*かもしれないため。
							 */
							if (!responseType || type.match(new RegExp(xhr.responseType))) {
								resolve(xhr.response);
							} else {
								reject(new GomakitError("Invalid response type:" + type));
							}
						} else {
							reject(new GomakitError("Request error:" + xhr.statusText));
						}
					}
				};
				xhr.ontimeout = () => reject(new GomakitError("Request timeout"));
				xhr.onerror = evt => reject(new GomakitError(evt));
				xhr.send(data);
			});
		},
		/**
		 * ajaxメソッドの第2引数は，引数のデフォルト値を残しつつ引数が渡されれば
		 * それを利用できるようにするための定義方法を用いている。
		 * 例えば次のようにデフォルト引数を定義してしまうと，引数をオブジェクトで
		 * 受け取った時にオブジェクトに含まれていなかったプロパティが対応する引数は
		 * undefinedが設定されてしまいデフォルト値を利用することができない。
		 * <code>
		 * {
		 *	a: 1,
		 *	b: 2,
		 *	c: 3
		 * }
		 * </code>
		 * 
		 * 参考:
		 * http://es6-features.org/#ObjectMatchingShorthandNotation
		 * http://es6-features.org/#FailSoftDestructuring
		 */
		ajax (url, {
				method = "GET",
				resolve = noop,
				reject = noop,
				responseType = "json",
				data = null,
				timeout = 0
			} = {}) {
			const promise = this.fetch(url, {
				method, responseType, data, timeout
			});

			promise.then(resolve).catch(reject);
		},
		getCommonUI(base) {
			const runner = this.select(base + " .runner"),
				clearer = this.select(base + " .clearer"),
				output = this.select(base + " .output"); 

			return { runner, clearer, output };
		},
		init(funcs) {
			if (!Array.isArray(funcs)) {
				if (this.isIterable(funcs)) {
					funcs = Array.from(funcs);
				} else {
					funcs = Array.of(funcs);
				}
			}
			
			Object.values(funcs).forEach(func => func(this));
		},
		isIteratable: isIteratable,
		Array: GomakitArray,
        fib(n, memo = {}) {
            if (n === 1 || n === 2) {
                return 1;
            }
            if (!(n in memo)) {
                memo[n] = this.fib(n - 1, memo) + this.fib(n - 2, memo);
            }
            return memo[n];
        }
    };

    win.Gomakit = Gomakit;
    /**
     * myにも代入するのは後方互換のため。
     */
    win.goma = win.my = Object.create(Gomakit.prototype);
}(window, document));
