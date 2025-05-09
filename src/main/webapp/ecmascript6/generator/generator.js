(function(win, doc, m, factory){
	/**
	 * "use strict"をここに記述しても引数の関数内部には影響を与えられない。
	 */
	
	var mygenerator = win.mygenerator;

	if(typeof mygenerator === "object" && typeof mygenerator.init === "object"){
		m.log(navigator.userAgent + "ではmygenerator名前空間の初期化は完了しています。");
	}else{
		win.mygenerator = factory(win, doc, m);
	}
	
}(window, document, my, function (win, doc, m) {
	"use strict";
	
	/**
	 * アスタリスクをfunctionキーワードの後ろに付けることで
	 * ジェネレータ関数を定義する。yield式を含む関数の宣言部に
	 * アスタリスクが付いていないとChrome44ではシンタックスエラーになる。
     * 
     * ジェネレータ関数をArrow Functionで記述するとスクリプト読み込み時に
     * エラーになってしまう。
	 */
	function* createCounter(limit) {
		for (var i = 0; i < limit; i++) {
			yield i + 1;
		}
	}
    
    /**
     * Arrow Functionはyieldを含むことができない。従ってArrow Functionで
     * ジェネレータ関数を表現することはできない。
     */
//    let createCounter = (limit) => {
//		for (var i = 0; i < limit; i++) {
//			yield i + 1;
//		}
//    };

	function initCounter() {
		var limit = 10;

		var nowCounter = createCounter(limit);

		var countGetter = m.ref("get-generator-count"),
			countResult = m.ref("count-result");

		m.addListener(countGetter, "click", function (evt) {
			try {
				/**
				 * ジェネレータの最新の値はvalueプロパティから取得する。
				 */
				var num = nowCounter.next().value;
				countResult.value = num;
			} catch (err) {
				if (err instanceof StopIteration) {
					countResult.value = "リセットして下さい";
					countGetter.disabled = "disabled";
				} else {
					throw err;
				}
			}
		}, false);

		m.addListener(m.ref("reset-generator-count"), "click", function (evt) {
			nowCounter = createCounter(limit);
			countResult.value = "";
			countGetter.disabled = null;
		}, false);
	}

    /**
     * @description 
     * ファイル読み込みを行うジェネレータ関数です。
     */
	function* createMyReader(ws, lineSize) {
		if (ws.readyState !== WebSocket.OPEN) {
			return;
		}
		
        /**
         * ここでWebSocket.sendを実行しなければジェネレータ関数を
         * 最初に実行した時にファイルの読み込みが行われない。そのため
         * もう1回読み込みボタンを押す必要が生じる。
         */
        ws.send(lineSize);
        
		/**
         * ジェネレータ関数の2回目以降のnextで評価されるのは
         * 以下のwhileブロック内のコードだけである。
		 * 無限ループさせることでStopIterationを送出させないようにしている。
		 * ジェネレータのnextメソッドに渡された引数はyield式の右辺に渡せる。
		 * nextメソッドの戻り値のvalueプロパティにはyield式に渡した値が
		 * 保存される。
		 */
		while(true)	{
			let newSize = yield lineSize;
			ws.send(newSize);
            m.log(newSize + "行読み込みました。");
		}
	}
	
	function getLineSize(){
		var size = parseInt(m.ref("read-byte-size").value);
		
		if(!isNaN(size) && size >= 1){
			return size;
		}else{
			return 1;
		}
	}
	
	function getPort(){
		var portEle = my.ref("read-byte-port");
		return portEle.value;
	}

	function initFileReader() {
		var resultArea = m.ref("result-read-area"),
			ws = null,
			reader = null;

		m.clickListener("run-file-reader", function () {
			if (ws === null || ws.readyState !== WebSocket.OPEN) {
    			m.println(resultArea, "接続を開始します。");
                
				ws = m.createWebSocket("myreader", {
					port : getPort()
				});

				ws.onopen = function () {
					reader = createMyReader(this, getLineSize());
                    /**
                     * このnextではWebSocket.sendされない。
                     * nextに引数を渡してもWebSocket.sendされない。
                     */
					var val = reader.next().value;
					m.log(val + "行ずつ読み込みます。");
				};

				ws.onclose = function (evt) {
					m.log(evt);
					m.println(resultArea, "接続を終了しました。" + evt.reason);
				};
				
				ws.onmessage = function (evt) {
					m.log(evt.data);
					var res = JSON.parse(evt.data);
                    
                    if(res.result !== "EOF"){
    					m.print(resultArea, res.result);
                    }else{
    					m.println(resultArea, "ファイルは全て読み込まれました。接続を終了します。");
                        this.close();
                    }
				};

				ws.onerror = function (evt) {
					m.println(resultArea, "ファイルの読み込みに失敗しました。");
				};
			}else{
				/**
				 * nextメソッドに引数を渡せばyield式に引数を渡すことができる。
				 * sendメソッドはECMAScript6の標準には存在しない。
				 */
				reader && reader.next(getLineSize());
			}
		});

		m.clickListener("close-file-reader", function () {
			if (ws !== null) {
				ws.close();
			}
		});

		m.clickListener("clear-read-result", function () {
			m.print(resultArea, "", true);
		});
	}
	
	const initAsyncEmulator = () => {
		const base = ".async-emulator ",
			runner = m.select(base + ".run-test"),
			clearer = m.select(base + ".clear-result"),
			resultArea = m.select(base + ".result-area");
		
		/**
		 * 非同期処理を行う時にasync/awaitを使う場合に近いコードを
		 * 記述できるようにする関数。以下のリンク先の内容を参考にした。
		 * https://gist.github.com/jakearchibald/31b89cba627924972ad6
		 */
		const spawn = generatorFunc => {
			let generator,
				onFulfilled,
				onRejected;
			
			const continuer = (action, args) => {
				let result;

				try {
					/**
					 * ジェネレータのnextが呼び出され，generatorFunc内でyieldが
					 * 指定されたコードの処理結果が評価される。
					 */
					result = generator[action](args);
				} catch (err) {
					return Promise.reject(err);
				}

				if (result.done) {
					return result.value;
				} else {
					return Promise.resolve(result.value).then(onFulfilled, onRejected);
				}
			};
			
			generator = generatorFunc();
			onFulfilled = continuer.bind(continuer, "next");
			onRejected = continuer.bind(continuer, "throw");
			
			return onFulfilled();
		};
		
		/**
		 * async/awaitをエミュレートすることを狙っているのでコールバック関数を
		 * 引数に取らない。
		 */
		const loadJSON = url => {
			/**
			 * ArrowFunctionでジェネレータ関数を記述することは仕様上できない。
			 * http://wiki.ecmascript.org/doku.php?id=harmony:generators#generator_functions
			 */
			return spawn(function* () {
				try {
					const asyncOperation = () => {
						/**
						 * spwan内でジェネレータのnextが呼び出された時にyieldを
						 * 指定したコード(ここではreadJSONの呼び出し)が評価される。
						 */
						console.log(`Try to read ${url}`);
						/**
						 * urlで参照されるファイルを読み込む非同期処理の関数呼び出し。
						 * 値を返さないとyieldが指定された式の左辺はundefinedになる。
						 */
						return m.fetch(url);
					};
					/**
					 * 従来はasyncOperation(callback)といった形で非同期処理を行い
					 * callback内でその結果を処理する。
					 * async/awaitをエミュレートできていれば，asyncOperationの
					 * コールバック関数を定義しなくてもJSONが得られる。
					 */
					const result = yield asyncOperation();
					console.log(result);
					return result;
				} catch (err) {
					return {
						message : err.message
					};
				}
			});
		};
		
		const display = s => m.println(resultArea, JSON.stringify(s));
		
		runner.addEventListener("click", () => {
			/**
			 * 呼び出し側でasync/awaitを指定しない場合はPromiseを使わないと
			 * 非同期処理の結果を受け取ることができない。
			 * Promise.resolveの引数にはthenの関数が受け取る引数を指定する。
			 */
			const promise = Promise.resolve(loadJSON("sample.json"));
			promise.then(result => display(result), err => display(err));
		});
		
		clearer.addEventListener("click", () => m.clear(resultArea));
	};

	function init() {
		initCounter();
		initFileReader();
		initAsyncEmulator();
	}

	doc.addEventListener("DOMContentLoaded", init, false);
}
));

