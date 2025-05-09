(function(win, doc, m){
    "use strict";
    
    function SampleInfo(info){
        this.name = info.name;
        this.age = info.age;
        this.memo = info.memo;
        this.password = info.password;
        
        m.freeze(this);
    }
    
    SampleInfo.prototype = {
        toString : function(){
            let s = `名前は${this.name}です。
            年齢は${this.age}です。
            パスワードは${this.password}です。
            追加情報は${this.memo}です。`;
            
            return s;
        }
    };
    
    /**
     * String Interpolationでメソッドを呼び出すことも可能。
     */
    function getSampleHTML(sampleInfo){
        let html = `
        <div>
            <p>名前:${sampleInfo.name}</p>
            <p>年齢:${sampleInfo.age}</p>
            <p>備考:${sampleInfo.memo}</p>
            <p>パスワード:${sampleInfo.password}</p>
    
            <em>${sampleInfo.toString()}</em>
        </div>
        `;
        
        return html;
    }
    
    let initTargets = [
        () => {
            m.clickListener("add-infomation", e => {
                let name = m.ref("sample-name").value,
                    age =  m.ref("sample-age").value,
                    memo =  m.ref("sample-memo").value,
                    password =  m.ref("sample-password").value;

                let sampleInfo = new SampleInfo({
                    name : name,
                    age : age,
                    memo : memo,
                    password : password
                });

                let html = getSampleHTML(sampleInfo);

                let targetContainer = m.ref("sample-infomation-container");
                targetContainer.innerHTML = html;
            });
        },
        () => {
            const base = ".string-raw-container ",
                inputArea = m.select(base + ".input-sample-string"),
                outputArea = m.select(base + ".output-sample-string");
            
            const getSampleStringKey = () => {
                return m.selected(m.selectAll(base + ".select-sample-string"));
            };
            
            /**
             * String.rawの呼び出しは以下のように書くこともできる。
             * const rawString = String.raw({raw: "test\ntest"});
             * 
             * 別の変数や定数に保存された文字列をString.rawに渡しても
             * エスケープシーケンスを含むような元の文字列の値を得ることはできない。
             * 即ちString.rawの引数に変数や定数を渡しても望んだ結果は得られない。
             */
            const sampleStrings = {
                linefeedcode: String.raw `linefeed\ncode`,
                tab: String.raw `tab\ttab`,
                unicode: String.raw `unicode\u0030unicode`
            };
            
            m.clickListener(m.select(base + ".view-raw-string"), () => {
                const rawString = sampleStrings[getSampleStringKey()];
                m.println(outputArea, rawString);
            });
            
            m.clickListener(m.select(base + ".clear-output"), () => {
                m.clear(outputArea);
            });
        },
		() => {
			const base = ".tagged-template-sample",
				resultArea = m.select(base + " .result-area");
			
			const getSelectedLang = () => {
				const langs = m.selectAll(base + " .tag-lang");
				const selectedLang = Array.from(langs).filter(lang => lang.checked);
				return selectedLang[0].value;
			};
			
			const greetingParts = {
				ja: {
					prefix: "こんにちは",
					suffix: "さようなら"
				},
				en: {
					prefix: "Hello",
					suffix: "Goodbye"
				}
			};
			
			/**
             * Tag Function
             * 
			 * 第1引数は「${}を使わずに渡された文字列」の配列になる。
			 * 例えば sampleFunc`${a}and${b}` だった場合，第1引数は
			 * ["", "and", ""]
			 * になる。最初と最後の空文字も渡されてくることに注意。
			 * 
			 * 第2引数以降は「${}を使って渡された文字列」になる。
			 * sampleFunc`${a}and${b}` ならば${a}の評価結果が第2引数，
			 * ${b}の評価結果が第3引数になる。
			 */
			const greeting = (strings, prefix, name, suffix) => {
				let sep1 = strings[0],
					sep2 = strings[1],
					sep3 = strings[2],
					sep4 = strings[3];
					
				return sep1 + prefix + sep2 + name + sep3 + suffix + sep4;	
			};
			
            m.clickListener(m.select(base + " .runner"), () => {
				const selectedLang = getSelectedLang();
				const templates = greetingParts[selectedLang];
				const name = m.select(base + " .username").value || "anonymous";
				const result = greeting`★${templates.prefix}!${name},${templates.suffix}♪`;
				m.println(resultArea, result);
            });
            
            m.clickListener(m.select(base + " .clearer"), 
				() => m.clear(resultArea));
		},
        () => {
            /**
             * Tag Functionは文字列だけでなく関数を返すこともできる。
             * 
             * 参考：
             * https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals
             * 「Tagged template literals」
             */
            const createTemplate = (strings, ...keys) => (...values) => {
                //console.log(strings, keys, values);
                const dict = values[values.length - 1] || {};
                const result = [strings[0]];
                keys.forEach((key, i) => {
                    const value = Number.isInteger(key) ? values[key] : dict[key];
                    result.push(value, strings[i + 1]);
                });
                return result.join("");
            };
            
            const testTagFunction = () => {
                const template1 = createTemplate`${0}${0}${1}!!!`;
                const result1 = template1("A", "H");
                console.log(result1);
                
                const template2 = createTemplate`${0} ... ${"templateDictKey"}!`;
                const result2 = template2("My name is", { templateDictKey: "hogehoge" });
                console.log(result2);
                
                const tagFunc = strings => {
                    return {
                        /**
                         * 引数がエスケープ文字を含んでいる場合，rawプロパティを
                         * 経由しないと引数の文字列の内容をそのまま扱うことができない。
                         * ブラウザのECMAScriptサポート状況によってはシンタックスエラーになる。
                         */
                        value: `*** ${strings[0]} ***`,
                        raw: `*** ${strings.raw[0]} ***`
                    };
                };
                const result3 = tagFunc`\table`;
                console.log(result3.value, result3.raw);
            };
            
            /**
             * 実運用ではこのようなテンプレートは別のJSONかデータベースに
             * 保存しておくと思われる。
             */
            const definedTemplates = {
                html: createTemplate`
<div class="user-container"><p>${0}</p><div class="user-contents">${"content"}</div></div>`,
                properties: createTemplate`${0}=${"content"}`,
                json: createTemplate`{ "${0}": "${"content"}" }`
            };
            
            const createContainer = ({
                type = "html",
                title = "none", 
                contents = { content: "something else" }
            } = {}) => {
                return definedTemplates[type](title, contents);
            };
            
            /**
             * 以下からWebページの構築に関わるコードになる。
             * DOMにアクセスするコードは分離するのが好ましい。
             */
            
            const base = ".tag-function-sample ",
                containerParent = doc.querySelector(base + ".user-container-output");                
                
            const getTempalteType = () => {
                const cont = doc.querySelector(base + ".template-type-container");
                const typeEles = cont.querySelectorAll("input[name=\"template-type\"]");
                const selectedTypeEles = Array.from(typeEles).filter(ele => ele.checked);
                return (selectedTypeEles[0] || {}).value;
            }; 
                
            const listener = () => {
                testTagFunction();
                
                const titleEle = doc.querySelector(base + ".user-container-title"),
                    contentsEle = doc.querySelector(base + ".user-container-contents");
                
                const title = titleEle.value, 
                    contents = {
                        content: contentsEle.value
                    };
                
                const type = getTempalteType();
                const result = createContainer({ type, title, contents });
                containerParent.innerHTML = result;
            };
            
            doc.querySelector(base + ".runner").addEventListener("click", listener);
            doc.querySelector(base + ".clearer").addEventListener("click", 
                () => containerParent.innerHTML = "");
        }
    ];
    
    m.loadedHook(() => initTargets.forEach(f => f()));
}(window, document, window.goma));
