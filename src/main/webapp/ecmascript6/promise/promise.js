(function(win, doc, m) {
	"use strict";

	var resultArea = m.ref("promise-result-area"),
		timeoutEle = m.ref("promise-timeout-seconds");

	var separator = ",";

	var resultCanvases = m.selectAll(".promise-result-canvas");

	/**
	 * Promiseの処理中にエラーが発生した時はthenに渡した関数は
	 * 自分で直接呼び出していない限り呼び出されない。
	 */
	function resolve(res) {
		m.println(resultArea, "計算結果=" + res.result);
		/**
		 * 返した値は後続のthenメソッドの引数に渡された関数で参照できる。
		 */
		return res;
	}

	/**
	 * Promiseの処理中にエラーが発生した時はどこで発生した場合でも
	 * rejectが呼び出される。この時の引数はErrorあるいはそのサブタイプの
	 * オブジェクトになっている。
	 */
	function reject(err) {
		m.println(resultArea, err.message);
		/**
		 * Firefox39ではthrowされたErrorがブラウザのデバッガに通知されるまでに
		 * 数秒から数十秒かかる。
		 * 
		 * throwしたErrorは後続のcatchメソッドの引数に渡された関数で参照できる。
		 */
		throw err;
	}

	/**
	 * thenに渡す関数はPromiseのコンストラクタ関数に渡した関数内で
	 * 直接呼び出していなくも，Promiseの処理が終われば呼び出される。
	 * この時の呼び出される関数の引数はundefinedになっている。
	 */
	function logging(res) {
		var logs = [
			new Date(),
			((res || {}).message || ""),
			((res || {}).status || "")
		];

		m.log(logs.join(separator));

		return res;
	}

	function PromiseError(baseMsg, result) {
		/**
		 * Object.freezeはenumerableをfalse(列挙不可)にはしない。
		 * 列挙も不可にしたい場合はdefineProperty等を使い自分で
		 * enumerableをfalseにする。
		 * 
		 * 本当に公開したくないprivateなプロパティは，書き込み(writable)と
		 * 設定(configurable)を不可にするだけでなく列挙(enumerable)も不可に
		 * した方が良い。
		 * 列挙不可にするとfor文による列挙はされなくなるが，
		 * プロパティ名を直接指定することによる読み取りは行える。
		 * つまりenumerable=falseはprivateではない。
		 * なお設定不可のオブジェクトを後からdefinePropertyで
		 * 列挙不可に設定することはできない。
		 */
		Object.defineProperties(this, {
			/**
			 * 元のエラーメッセージを保持するrawMessageプロパティは，
			 * ・書き込み不可
			 * ・列挙不可
			 * ・設定不可(プロパティの追加，編集，削除不可)
			 * にする。
			 */
			rawMessage : {
				value : baseMsg,
				writable : false,
				enumerable : false,
				configurable : false
			},
			/**
			 * resultとstatusはfreezeされた状態と同じ。
			 */
			result : {
				value : result || {},
				writable : false,
				enumerable : true,
				configurable : false
			},
			status : {
				value : (result || {}).status,
				writable : false,
				enumerable : true,
				configurable : false
			}
		});
	}

	PromiseError.prototype = Object.create(Error.prototype);

	/**
	 * definePropertiesを使わず静的なヘルパーメソッドを使うことでも
	 * エラーメッセージの整形は行える。ただし静的メソッドは公開される。
	 * 静的メソッドがオブジェクト内部で使うためだけのヘルパーメソッドだった場合は
	 * definePropertyやdefinePropertiesを使ってプロパティ記述子を
	 * 設定する方が良いかもしれない。
	 */
	Object.defineProperties(PromiseError.prototype, {
		message : {
			get : function() {
				/**
				 * PromiseErrorオブジェクト共通の説明をエラーメッセージに付ける。
				 * 正常終了時とログ出力の流れを揃えるためにstatusはここでは付与せず
				 * logging関数内で付与する。PromiseErrorがstatusプロパティを
				 * 持っているのはそのためである。
				 */
				return "Promiseの処理中にエラーが発生しました。" + this.rawMessage;
			},
			/**
			 * rawMessageを列挙不可にし整形されたmessageを列挙可にする。
			 */
			enumerable : true,
			configurable : false
		}
	});

	function promiseFunc(resolve, reject) {
		m.log(new Date() + separator + "Promiseの準備を開始します。");

		var urlParts = [
			"/webcise/Calculator?"
		];
		var params = m.values(m.refs("promise-parameter"));
		for (var i = 0, len = params.length; i < len; i++) {
			urlParts.push("parameter=" + params[i]);
		}
		var op = m.selected(m.refs("promise-operator"));
		urlParts.push("operator=" + op);
		var url = urlParts.join("&");

		var xhr = new XMLHttpRequest();
		xhr.open("GET", url);
		xhr.timeout = timeoutEle.value;
		xhr.onreadystatechange = function() {
			if (this.readyState === XMLHttpRequest.DONE) {
				try {
					var res = JSON.parse(this.responseText);
					if (res.status === 200) {
						resolve(res);
					} else {
						reject(new PromiseError("calculation failed", res));
					}
				} catch (parseErr) {
					/**
					 * @todo
					 * こちらのrejectが呼び出されるとontimeout等のハンドラが呼び出されない。
					 */
					reject(new PromiseError(parseErr.message));
				}
			}
		};
		xhr.onerror = function() {
			reject(new PromiseError("http error!"));
		};
		xhr.ontimeout = function() {
			reject(new PromiseError("timeout!"));
		};
		xhr.send(null);
	}

	function run() {
		var promise = new Promise(promiseFunc);

		m.log(new Date() + separator + "Promiseが作成されました。");

		/**
		 * Promiseの成否に関わらず呼び出したい関数はthenとcatchの両方に
		 * 渡しておかなければならない。finally的な関数は無いのか？
		 * thenにもcatchにも渡す関数(ここではlogging)の引数のインターフェースは
		 * 統一されているべきである。
		 */
		promise.then(resolve)
			.then(logging)
			.catch(reject)
			.catch(logging);

		m.log(new Date() + separator + "Promiseの関数を設定しました。");
	}

	/**
	 * Promiseの拡張テスト
	 */
//	Promise.prototype.finally = function(func, opt_value){
//		var fn = function(value){
//			func(value);
//			return opt_value || value;
//		};
//		
//		this.then(fn);
//		this.catch(fn);
//	};

	function preparePromise(chainEle) {
		/**
		 * Promise.resolveやPromise.rejectだと
		 * 成功・失敗毎のPromiseを生成することになる。
		 */
		if (chainEle.checked) {
			return Promise.resolve({
				then : function(resolve, reject) {
					resolve(chainEle.value + " Promise 成功");
				}
			});
		} else {
			return Promise.reject({
				then : function(resolve, reject) {
					reject(chainEle.value + " Promise 失敗");
				}
			});
		}
	}

	function getChainPromise(chainEle) {
		return new Promise(function(resolve, reject) {
			if (chainEle.checked) {
				resolve(chainEle.value + " Promise 成功");
			} else {
				reject(chainEle.value + " Promise 失敗");
			}
		});
	}

	function chainPromises() {
		var chains = m.refs("promise-state-check"),
			ps = Array.prototype.map.call(chains, getChainPromise);

		m.log(ps);

		/* Firefox39で試したところletがシンタックスエラーになった。 */
//		let [p1, p2, p3] = ps;
//		
//		p1.then(function(){
//			return p2;
//		}).then(function(){
//			return p3;
//		});

		var func = function(value) {
			m.println(resultArea, value);
			return value;
		};

		var returnPromiseFunc = function(fn, promise) {
			return function(value) {
				fn(value);
				return promise;
			};
		};

		for (var pIdx = 0, pSize = ps.length; pIdx < pSize; pIdx++) {
			var current = ps[pIdx],
				next = ps[pIdx + 1];

			if (next) {
				var fn = returnPromiseFunc(function(value) {
					func(value);
				}, next);

				/**
				 * rejectされたPromiseの処理はcatchの関数で行われ，
				 * その後thenの関数の処理が行われる。
				 */
				current.catch(fn).then(fn);
			} else {
				current.catch(func).then(func);
			}
		}
	}

	function drawImage(img, onScreenCanvas) {
		var offScreenCanvas = doc.createElement("canvas");
		offScreenCanvas.width = onScreenCanvas.width;
		offScreenCanvas.height = onScreenCanvas.height;
		var offCtx = offScreenCanvas.getContext("2d");
		offCtx.drawImage(img, 0, 0);

		var onCtx = onScreenCanvas.getContext("2d");
		onCtx.clearRect(0, 0, onScreenCanvas.width, onScreenCanvas.height);

		var offImg = offCtx.getImageData(0, 0, offScreenCanvas.width, offScreenCanvas.height);
		onCtx.putImageData(offImg, 0, 0);
	}

	function createImage(url, onloadCallback, onerrorCallback) {
		var img = new Image();
		img.onload = function(evt) {
			onloadCallback(this);
		};
		img.onerror = onerrorCallback;

		var noCache = new Date().getTime();
		img.src = url + "?" + noCache;
	}

	function clearPromiseImage() {
		Array.prototype.forEach.call(resultCanvases, function(cvs) {
			cvs.getContext("2d").clearRect(0, 0, cvs.width, cvs.height);
		});
	}

	function drawPromiseImage() {
		var p1 = new Promise(function(resolve, reject) {
			createImage("star1.jpg", resolve, reject);
		});
		var p2 = new Promise(function(resolve, reject) {
			createImage("star2.jpg", resolve, reject);
		});
		var p3 = new Promise(function(resolve, reject) {
			createImage("star3.jpg", resolve, reject);
		});

		/**
		 * Promise.allの引数の配列要素の順序はthenが受け取る配列要素の順序と
		 * 一致する。各Promiseの処理は並列で行われているのか，コールバックを
		 * 入れ子にした時のように順次行われているのかは不明である。
		 */
		var pAll = Promise.all([p1, p2, p3]);

		pAll.then(function(values) {
			values.forEach(function(img, idx, imgs) {
				drawImage(img, resultCanvases[idx]);
			});
		});
	}

	function downloadPromiseRace() {
		var imgContainer = m.ref("promise-race-result");
		imgContainer.innerHTML = "";
		var checks = m.refs("promise-download-image-check");

		var ps = Array.prototype.map.call(checks, function(el) {
			var imgName = el.value;
			if (!el.checked) {
				imgName += "_reject";
			}
			imgName += ".jpg";

			var p = new Promise(function(resolve, reject) {
				var img = new Image();
				img.onload = function(evt) {
					resolve(this);
				};
				img.onerror = function(image) {
					reject(new Error(this.src + "のダウンロードに失敗しました。"));
				};
				img.src = imgName;
			});

			return p;
		});

		var allPs = Promise.race(ps);

		/**
		 * 先に成功するPromiseがあれば，その後で失敗するPromiseがあったとしても
		 * thenだけが処理されcatchは無視される。
		 */
		allPs.then(function(value) {
			imgContainer.appendChild(value);
		}).catch(function(err) {
			m.println(resultArea, err.message);
		});
	}

	function sendRequest(ws, startNumber, limit) {
		ws.send(startNumber + "," + limit);
	}

	function createWebSockect() {
		var host = location.host,
			port = 8080;

		return new WebSocket("ws://" + host + ":" + port + "/webcise/prime");
	}

	function WSResult(ws, pid, pm) {
		this.ws = ws;
		this.promiseId = pid;
		this.param = parseInt(pm);

//				Object.defineProperties(this, {
//					id : {
//						value : "Resend:" + this.promiseId
//					},
//					webSocket : {
//						get : function() {
//							if (this.isOpen()) {
//								return this.ws;
//							} else {
//								return createWebSockect();
//							}
//						}
//					}
//				});
	}

	WSResult.prototype = {
		close : function() {
			this.ws.close();
		},
		isOpen : function() {
			return this.ws.readyState === WebSocket.OPEN;
		},
		inc : function() {
			/* paramが文字だと1が文字列連結されることに注意せよ。 */
			//this.param += 1;
			return ++this.param;
		},
		getPromiseId : function() {
			return this.promiseId;
		},
		getWebSocket : function() {
			if (this.isOpen()) {
				return this.ws;
			} else {
				return createWebSockect();
			}
		}
	};

//			Object.defineProperty(WSResult.prototype, "id", {
//				value : "Resend:" + this.promiseId
//			});

	function WSError(ws) {
		this.ws = ws;
	}

	WSError.prototype = Object.create(Error.prototype);

	WSError.prototype.close = function() {
		this.ws.close();
	};

	function getPrimePromise(promiseId, param, lim, existingWs) {
		var p = new Promise(function(resolve, reject) {
			/**
			 * Promiseで包んでやることでWebSocketを大きなスコープで管理する必要が
			 * 無くなる。
			 */
			var ws = existingWs || createWebSockect();

			ws.onopen = function() {
				m.println(resultArea, "Promise" + promiseId + " 接続開始");
				sendRequest(this, param, lim);
			};

			ws.onclose = function(evt) {
				var reason = "code " + evt.code + " reason " + evt.reason;
				var txt = "Promise" + promiseId + "を[" + reason + "]で接続を閉じました。\n";
				txt += "意図的な切断" + (evt.wasClean ? "です。" : "ではありません。") + "\n";
				m.println(resultArea, txt);
			};

			ws.onmessage = function(evt) {
				m.println(resultArea, "Promise" + promiseId + " 計算結果▼");
				var res = JSON.parse(evt.data);
				m.println(resultArea, res.result);
				resolve(new WSResult(this, promiseId, param));
				sendRequest(this, param, lim);
			};

			ws.onerror = function(evt) {
				m.println(resultArea, evt);
				reject(new WSError(this));
			};
		});

		return p;
	}

	function getPromiseLimitSize() {
		return m.ref("promise-prime-limit-size").value;
	}

	function isPromisePrimeClosed() {
		return m.ref("promise-prime-check").checked;
	}

	function getPrimes() {
		var inputs = m.selectAll(".promise-prime-number");

		var ps = Array.prototype.map.call(inputs, function(el) {
			return getPrimePromise(el.id, el.value, getPromiseLimitSize());
		});
		
		/**
		 * Promiseを毎回newしていてもthenは1回しか呼び出されないことがある。
		 */
		var promiseAll = function(ps) {
			var allPs = Promise.all(ps);

			allPs.then(function(wss) {
				if (isPromisePrimeClosed()) {
					wss.forEach(function(wsRes) {
						wsRes.close();
					});
				} else {
					var newPs = wss.map(function(wsRes) {
						return getPrimePromise(wsRes.getPromiseId(),
							wsRes.inc(),
							getPromiseLimitSize(),
							wsRes.getWebSocket());
					});

					setTimeout(function() {
						promiseAll(newPs);
					}, 5000);
				}
			}).catch(function(wsErr) {
				wsErr.close();
			});
		};

		promiseAll(ps);
	}
	
	(function() {
		m.addListener(m.ref("promise-runner"), "click", run, false);

		m.addListener(m.ref("clear-promise-element"), "click", function() {
			m.print(resultArea, "", true);
		}, false);

		m.addListener(m.ref("promise-chain-runner"), "click", chainPromises, false);

		m.addListener(m.ref("promise-image-downloader"), "click", drawPromiseImage, false);
		m.addListener(m.ref("promise-image-clearer"), "click", clearPromiseImage, false);

		m.addListener(m.ref("promise-race-downloader"), "click", downloadPromiseRace, false);

		m.addListener(m.ref("promise-prime-calc-executer"), "click", getPrimes, false);
	}());

}(window, document, goma));
