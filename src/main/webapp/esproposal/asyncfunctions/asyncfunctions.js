((win, doc) => {
    "use strict";
    const loadJSON = async url => {
        /**
         * async/awaitを指定しない場合，以下の呼び出しはPromiseを返す。
         * awaitはPromiseのthenに近い処理を行っているものと思われる。
         * async/awaitにはPromiseを返す関数を指定する。
         */
        const response = await fetch(url);

        /**
         * 非同期関数呼び出しでawaitを指定せずPromiseが返された場合，
         * Promiseの処理結果に対するエラーチェックを行うにはthenあるいは
         * catchのコールバック内で行うことになる。そのため関数の呼び出し元に
         * 例外を伝搬するのが難しくなる。
         */
        if (!response.ok) {
            throw new Error(`Failed load ${url}.`);
        }

        const json = await response.json();

        return json;
    };

    class AsyncBasicExam {
        constructor(base) {
            this.base = base;
        }

        setup(g) {
            const resultArea = g.sel(".result-area", this.base),
                    runner = g.sel(".async-runner", this.base),
                    clearer = g.sel(".result-clearer", this.base);

            /**
             * asyncが指定されていないブロック内にawaitを書くとシンタックスエラーになる。
             */
            g.clickListener(runner, async () => {
                let json = {};

                try {
                    /**
                     * async/awaitを指定しないと空のJSONが返される。
                     * async/awaitを使うことで例外が伝搬しやすくなり，
                     * 非同期処理中に発生した例外を呼び出し側で処理しやすくなる。
                     */
                    json = await loadJSON("sample.json");
                } catch (err) {
                    json.message = `Load error: ${err.message}`;
                }

                /**
                 * async/awaitを使わない場合，以下のように非同期処理に後続する処理は
                 * 非同期関数のコールバックとして渡す必要がある。
                 */
                g.println(resultArea, JSON.stringify(json));
            });

            g.clickListener(clearer, () => g.clear(resultArea));
        }
    }

    const forAwaitOf = g => {
        const base = doc.querySelector(".forawaitof-sample");
        const resultArea = base.querySelector(".result-area"),
                runner = base.querySelector(".run"),
                clearer = base.querySelector(".clear");

        // nextの戻り値はundefinedになってしまう。
        const doSample = async function* () {
            const resources = [
                "data1.json", "data2.json", "data3.json"
            ];
            for (const resource of resources) {
                yield await (await fetch(resource)).json();
            }
        };

        let dataGenerator;
        const sampleHandler = async () => {
            if (!dataGenerator) {
                dataGenerator = await doSample();
            }
            const obj = dataGenerator.next();
            if (!obj.done) {
                g.println(resultArea, obj.value);
            } else {
                obj = null;
            }
        };

        runner.addEventListener("click", async () => {
            const content = [
                "Hello",
                "My",
                "name",
                "is",
                "Foo"
            ];
            // 非同期処理にならない箇所にasync/awaitを指定してもエラーにはならない。
            for await (const line of content) {
                g.println(resultArea, line);
            }
        });

        clearer.addEventListener("click", () => g.clear(resultArea));
    };

    const samples = {
        forAwaitOfSample2() {
            const base = doc.querySelector(".forawaitof-sample2"),
                  runner = base.querySelector(".run"),
                  clearer = base.querySelector(".clear"),
                  resultArea = base.querySelector(".result-area");
          
            class JsonIterator {
                constructor(paths) {
                    this.paths = paths;
                    this.index = 0;
                }
                
                // [Symbol.iterator]だとiterationが終了しなくなる。
                [Symbol.asyncIterator]() {
                    return {
                        next: () => {
                            return new Promise(async (resolve, reject) => {
                                if (this.index >= this.paths.length) {
                                    resolve({
                                        done: true
                                    });
                                } else {
                                    const response = await fetch(this.paths[this.index++]);
                                    if (response.ok) {
                                        resolve({
                                            done: false,
                                            value: response.json()
                                        });
                                    } else {
                                        reject(new Error(`Error: ${response.status}`));
                                    }
                                }
                            });
                        }
                    };
                }
            }
          
            runner.addEventListener("click", async () => {
                const iter = new JsonIterator([
                    "data1.json", "data2.json", "data3.json"
                ]);
                
                for await (const result of iter) {
                    if (!result) {
                        resultArea.innerHTML += `result is ${result} <br />`;
                        break;
                    }
                    // awaitを指定してiterateしているのだからPromiseではなく
                    // resolveに渡した結果が直接返ってきてほしい。ただthenの引数の
                    // valueはResponse.json()の戻り値になっている。
                    result.then(value => {
                        resultArea.innerHTML += `${JSON.stringify(value)} <br />`;
                    });
                    //resultArea.innerHTML += `${result} <br />`;
                }
            });
                  
            clearer.addEventListener("click", () => {
                resultArea.innerHTML = "";
            });
        },
        forAwaitOfSample3() {
            const base = doc.querySelector(".forawaitof-sample3"),
                  bound = base.querySelector(".bound"),
                  size = base.querySelector(".size"),
                  runner = base.querySelector(".run"),
                  clearer = base.querySelector(".clear"),
                  resultArea = base.querySelector(".result-area");
            
            
            const getRandomNumber = async function* () {
                if (!bound.value) {
                    return;
                }
                const url = `/webcise/RandomNumber?bound=${parseInt(bound.value)}`;
                while (true) {
                    const response = await fetch(url);
                    const json = await response.json();
                    yield Number(json.result); 
                }
            };
            
            runner.addEventListener("click", async () => {
                if (!size.value) {
                    return;
                }
                
                let count = 0, 
                    limit = parseInt(size.value);
                for await (const number of getRandomNumber()) {
                    resultArea.innerHTML += `${number}`;
                    if (++count < limit) {
                        resultArea.innerHTML += `,`;
                    } else {
                        resultArea.innerHTML += `<br />`;
                        break;
                    }
                }
            });
            
            clearer.addEventListener("click", () => {
                resultArea.innerHTML = "";
            });
        }
    };

    const main = g => {
        const exams = [new AsyncBasicExam(g.sel(".async-sample"))];
        exams.forEach(exam => exam.setup(g));
        forAwaitOf(g);
        
        Object.keys(samples).forEach(name => samples[name]());
    };

    win.goma.init(main);
})(window, document);
