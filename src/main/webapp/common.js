/**
 * @deprecated 
 * gomakit.jsに移行すること。
 */

console.warn("common.jsは破棄予定です。gomakit.jsに移行して下さい。");

(function (win, doc) {
    "use strict";

    var commonNS,
            my;

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

    var my = {
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
        select: function (selector, doc) {
            return (doc || document).querySelector(selector);
        },
        export: function (name, ns) {
            win[name] = ns;
        },
        addListener: function (element, type, fn, capture) {
            /* IE8以下には対応しない。 */
            element.addEventListener(type, fn, capture);
        },
        removeListener: function (element, type, fn, capture) {
            /* IE8以下には対応しない。 */
            element.removeEventListener(type, fn, capture);
        },
        prevent: function (evt) {
            evt.preventDefault();
        },
        noop: function () {
            /* Does nothing. */
        },
        alwaysTrue: function () {
            return  true;
        },
        alwaysFalse: function () {
            return false;
        },
        selected: function (eles, opts) {
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
        values: function (eles) {
            var vals = [];
            Array.prototype.forEach.call(eles, function (el) {
                vals.push(el.value);
            });

            return vals;
        },
        freeze: function (obj, names) {
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
        },
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
                    host = location.host,
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
                        reject(new Error(value));
                    }
                } catch (err) {
                    reject(err);
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
            var a = [];

            Array.prototype.forEach.call(src, function (el) {
                a.push(el);
            });

            return a;
        },
        strp: strp,
        funcp: funcp,
        forEach: function (targets, func) {
            if (Array.isArray(targets)) {
                targets.forEach(func);
            } else {
                Array.prototype.forEach.call(targets, func);
            }
        },
        run: function (targets) {
            var that = this;

            var initFunc = function () {
                for (var name in targets) {
                    if (funcp(targets[name])) {
                        targets[name]();
                        that.log(name + "を初期化しました。");
                    }
                }
            };

            this.loadedHook(initFunc);
        }
    };

    if (!commonNS && !my) {
        win.commonNS = win.my = my;
    }
}(window, document));