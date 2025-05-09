new Gomakit().run(
    g => {
        let assignClass = ".assign-sample-area ";
        
        let resultArea = g.select(assignClass + ".result-area"),
            eles = g.selectAll(assignClass + ".assign-value");
            
        let propNames = ["a", "b", "c"];
        let result;
        
        g.clickListener(g.select(assignClass + ".assign-executer"), e => {
            let [a, b, c] = Array.prototype.map.call(eles, (ele, index) => {
                return { 
                    [propNames[index]]: ele.value
                };
            });

            result = Object.assign(a, b, c);
            
            for(let name of Object.keys(result)){
                g.println(resultArea, name + ":" + result[name]);
            }
        });
        
        g.clickListener(g.select(assignClass + ".assign-clearer"), e => {
            /**
             * このブロックをArrow Functionで記述した場合，thisは
             * Windowオブジェクトになる。strictモードでも同様である。
             * もしイベントリスナを登録した要素をthisで参照したい場合は
             * function式を使う必要がある。
             */
            g.clear(resultArea);
        });
        
        function Sample(name){
            this.name = name;
        }
        
        Sample.prototype.toString = function() {
            return this.name + " by Sample object.";
        };
        
        g.clickListener(g.select(assignClass + ".assign-merger"), e => {
           result = result || {};
            
           let appendObj = {
               greeting: "hello",
               [Symbol("hoge")]: "hoge",
               greet: () => "hello",
               greetFunc: function(){ return this.greeting; },
               sample: new Sample("fuga")
           };
           
           /**
            * Firefox44ではオブジェクトのキーにSymbolを指定すると
            * そのプロパティがconsole.logで表示されない。
            * appendObj[[Symbol("hoge")]]というコードは許容されない。
            * SymbolをStringに変換することが許されないためである。
            */
           g.log(appendObj);
           /**
            * Symbolをキーにしたプロパティを得るにはObject.getOwnPropertySymbolsで
            * オブジェクトに紐付く全てのSymbolを得て，それをオブジェクトのキーに指定する。
            */
           let syms = Object.getOwnPropertySymbols(appendObj);
           g.log(appendObj[syms[0]]);
           
           /**
            * 関数やオブジェクトもそのまま複製することができる。
            */
           let mergedObj = Object.assign({}, result, appendObj);
           
           /**
            * writableがfalse(読み取り専用)なプロパティを含んでいるオブジェクトも
            * マージできる。しかしwritableがfalseだと列挙されない。
            */
           let nonWritableObj = Object.defineProperty({}, "ro", {
               value: "read only test",
               writable: false
           });
           mergedObj = Object.assign(nonWritableObj, mergedObj);
           /**
            * 以下は読み取り専用プロパティに書き込みを試みてしまうためエラーになる。
            */
           //mergedObj = Object.assign(nonWritableObj, mergedObj, {ro: "error test"});
           g.log(mergedObj.ro);
           g.log(mergedObj);
           
           /**
            * IteratorはECMAScriptの標準ではない。Chrome等では実装されていない。
            * Iteratorを使わないオブジェクトをfor...ofで反復することはできない。
            * SymbolのキーはObject.keysの戻り値に含まれない。
            */
           for(let name of Object.keys(mergedObj)){
               g.println(resultArea, name + ":" + mergedObj[name]);
           }
           
           /**
            * SymbolはObject.getOwnPropertySymbolsを介して列挙する必要がある。
            * 当然こちらの方法ではSymbolしか列挙できない。
            * 他のプロパティと同じように列挙できないのはミスに繋がるので
            * Symbolをオブジェクトのキーにしない方がいいかもしれない。
            */
           syms.forEach(sym => g.println(resultArea, "Symbol:" + mergedObj[sym]));
        });
        
        g.clickListener(g.select(assignClass + ".assign-primiteive-executer"), e => {
            let globalSymbol = Symbol.for("sample global symbol");
            
            g.log(Symbol.keyFor(globalSymbol));
            
            let result = Object.assign(1, true, "text", globalSymbol, null, undefined);
            
            /**
             * Object.assignにnullやundefinedを渡しても無視される。
             * また自身のプロパティを列挙できない値も無視される。そのため
             * 上のObject.assignではBooleanとNumberは無視され，Stringだけが
             * Object.assignを適用されている。つまり上の例では
             * <code><pre>
             * let result = Object.assign("text");
             * </pre></code>
             * と同じコードが実行されている。このコードをAとおく。
             * 
             * 文字列は以下のコードで列挙を試みると「文字のインデックス:文字」
             * と表現される。(注:IteratorはFirefoxのみで利用可能)
             * <code><pre>
             * let t = "text";
             * for(let [k, v] of Iterator(t))console.log(k + ":" + v);
             * </pre></code>
             * コードAのObject.assignはこの形式で表現されたオブジェクトを返している。
             */
            g.forEach(result, key => 
                    g.println(resultArea, key + ":" + result[key]));
        });
    }
);
