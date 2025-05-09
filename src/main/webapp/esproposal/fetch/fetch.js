((win, doc, g) => {
	"use strict";
	
	const getResultArea = base => g.select(base + ".result-area");

	const dumpHeaders = headers => {
		Array.from(headers.entries()).forEach(header => {
			const [key, value] = header;
			console.log(`${key} : ${value}`);
		});
	};
	
	const getRequest = (resource, args = {
		method = "GET",
		mode = "cors",
		headers = new Headers({
			"X-webcise-sample-default-header": "WEBSICE_DEFAULT"
		})
	} = {}) => {
		const request = new Request(resource, args);
		
		console.log(request);
		
		return request;
	};
	
	const validContentType = (response, type) => {
		const contentType = response.headers.get("content-type");
		
		if (contentType && contentType.indexOf(type) >= 0) {
			return true;
		} else {
			return false;
		}
	};
	
	class FetchError extends Error {
		constructor(status, statusText) {
			/**
			 * superを呼び出していないとこのクラスのインスタンスが初期化されていないとして
			 * エラーが発生する。
			 */
			super();
			this.status = status;
			this.statusText = statusText;
		}
		
		toJSON() {
			const json = {
				status: this.status,
				statusText: this.statusText
			};
			
			/**
			 * JSON.stringifyを呼び出した結果を返すと不要にクォートされた結果が
			 * 表示されてしまう。
			 */
			return json;
		}
		
		get message() {
			return "Fetch error!:" + this.statusText + " " + this.status;
		}
	}
	
	/**
	 * 組み込みのfetch関数をasync/awaitで呼び出してBodyオブジェクトを
	 * 得る。awaitイコールthen1回分resolveすると考える。
	 */
	const doFetch = async request => {
		const response = await fetch(request);
		dumpHeaders(response.headers);

		if (!response.ok) {
			throw new FetchError(response.status, response.statusText);
		}
		
		return response;
	};
	
	const loadImage = async (resource, options = {}) => {
		/**
		 * fetch関数にresourceとoptionsを直接渡しても問題無い。
		 */
		const response = await doFetch(getRequest(resource, options));
		if (!validContentType(response, "image/")) {
			throw new Error("Haven't got image");
		}
		
		const blobUrl = URL.createObjectURL(await response.blob());

		const img = new Image();
		img.onload = () => {
			URL.revokeObjectURL(blobUrl);
			console.log("Revoked blob url:" + blobUrl);
		};
		img.src = blobUrl;

		return img;
	};

	const funcs = {
		fetchSample(g) {
			const base = ".fetch-request-sample ";

			const loader = g.select(base + ".load-image"),
				area = getResultArea(base);

			loader.addEventListener("click", async () => {
				const resource = "samplestar.png";
				const img = await loadImage(resource);
				area.innerHTML = "";
				area.appendChild(img);
			});
		},
		headersSample() {
			const base = ".headers-request-sample ";

			const loader = g.select(base + ".load-image"),
				area = getResultArea(base);

			loader.addEventListener("click", async () => {
				const headers = new Headers();

				const header1 = "X-webcise-sample-header-numbers",
					header2 =  "X-webcise-sample-header-names";
					
				headers.append(header1, "123");
				headers.append(header1, "456");
				headers.append(header1, "789");
				
				headers.set(header2, "foo");
				headers.set(header2, "bar");
				headers.set(header2, "baz");
				
				dumpHeaders(headers);

				const options = {
					method: "GET",
					headers,
					mode: "cors",
					cache: "default"
				};

				const resource = "samplestar.png";
				const img = await loadImage(resource, options);
				area.innerHTML = "";
				area.appendChild(img);
			});
		},
		requestSample() {
			const base = ".new-request-sample ";

			const loader = g.select(base + ".load-image"),
				area = getResultArea(base);

			loader.addEventListener("click", async () => {
				const options = {
					method: "GET",
					headers: {
						"X-webcise-sample-header-value": "SAMPLEWEBCISE"
					},
					mode: "cors",
					cache: "default"
				};
				const resource = "samplestar.png";
				const img = await loadImage(resource, options);
				area.innerHTML = "";
				area.appendChild(img);
			});
		},
		modeSelectionSample() {
			const base = ".request-mode-sample ";

			const loader = g.select(base + ".load-image"),
				area = getResultArea(base),
				modeEles = g.selectAll(base + ".mode-type-select-panel input[type='radio']");
			
			/**
			 * クロスオリジンになるようなリソースを指定する。
			 */
			const resource = "//localhost/webcise/esproposal/fetch/samplestar.png";
			
			const getMode = () => {
				const eles = Array.from(modeEles).filter(ele => ele.checked);
				
				if (eles.length > 0) {
					return eles[0].value;
				} else {
					/**
					 * FirefoxではRequestオブジェクト生成時の引数に渡すmodeに
					 * nullや空文字を渡すとデフォルトのmodeを使おうとせずエラーになる。
					 */
					return undefined;
				}
			};
			
			loader.addEventListener("click", async () => {
				const options = {
					method: "GET",
					mode: getMode(),
					cache: "no-cache",
					/**
					 * HTTPレスポンスヘッダのAccess-Control-Allow-Credentialsに
					 * trueが指定されていないとcredentialsにincludeを指定してリクエスト
					 * した時エラーになる。Access-Control-Allow-Credentialsに
					 * trueを指定する場合，Access-Control-Allow-Originに*ではなく
					 * 明示的なオリジンを指定しなければやはりエラーになる。
					 * Access-Control-Allow-OriginにはHTTPリクエストヘッダの
					 * Originに指定されている値と同じ値を指定する。
					 * 
					 * 参考:
					 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
					 */
					credentials: "include"
				};
				const img = await loadImage(resource, options);
				area.innerHTML = "";
				area.appendChild(img);
			});
		},
		requestBodySample() {
			const base = ".request-body-sample ";
			
			const inputArea = doc.querySelector(base + ".url-text"),
				resultArea = doc.querySelector(base + ".result-area"),
				runner = doc.querySelector(base + ".post-data");
			
			const login = async params => {
				let result;
				
				try {
					const response = await doFetch(getRequest("/webcise/Login", {
						method : "POST",
						body : params
					}));

					if (response.ok) {
						result = await response.json();
					} else {
						/**
						 * statusTextの値はブラウザによって異なる。エラーが発生して
						 * いても値が空文字のこともある。従ってstatusTextを用いて
						 * 判定処理を行ってはならない。
						 * 
						 * サーバ側で適切にエラーを送信していればここに到達することは
						 * ないのではないか？
						 */
						throw new FetchError(response.status, response.statusText);
					}
				} catch (err) {
					console.error(err.message);
					result = err;
				}
				
				return result;
			};
			
			runner.addEventListener("click", async () => {
				const inputUrl = inputArea.value.trim();
				/* reduceの第2引数を常に返すことでsplit結果の最後の要素を得る。 */
				const search = inputUrl.split("?").reduce((a, b) => b);
				/**
				 * URLSearchParamsはクエリ文字列(?より後ろの部分)を自動的に
				 * 抽出してくれたりはしない。最初の&が現れるまでをパラメータ名と
				 * 解釈してしまう。
				 */
				const params = new URLSearchParams(search);

				Array.from(params).forEach(console.log);

				resultArea.innerHTML = JSON.stringify(await login(params));
			});
		},
		responseSample() {
			const base = ".new-response-sample ";
			
			const area = doc.querySelector(base + ".result-area"),
				fileSelector = doc.querySelector(base + ".file-selector"),
				runner = doc.querySelector(base + ".runner");
				
			/**
			 * 以下のコードが呼び出されることはない。
			 * FetchEventはServiceWorker内でしか発生しないのかもしれない。
			 */
			win.addEventListener("fetch", evt => {
				const dummy = {
					message: "dummy response"
				};

				const headers = new Headers();
				headers.append("Content-Type", "application/json");
				headers.append("X-webcise-dummy-response-header", "Replaced header!");
				
				const response = new Response(dummy, {
					headers
				});
				
				evt.responseWith(response);
			});
			
			runner.addEventListener("click", async () => {
				const files = fileSelector.files;
				
				if (files.length <= 0) {
					return;
				}
				
				const formData = new FormData();
				const file = files[0];
				formData.append("filename", file.name);
				formData.append("samplefile", files[0]);
					
				area.innerHTML = "アップロード中...";	
					
				const response = await doFetch(getRequest("/webcise/Upload", {
					method : "POST",
					body : formData
				}));
					
				area.innerHTML = JSON.stringify(await response.json());
			});
		},
        keepaliveCheck() {
            const base = doc.querySelector(".keepalive-check-sample"),
                runner = base.querySelector(".runner"),
                clearer = base.querySelector(".clearer"),
                resultArea = base.querySelector(".result-area");
                
            const display = content => {
                resultArea.innerHTML += `${content}<br />`;
            };    
            
            const resetArea = () => resultArea.innerHTML = "";
                
            /**
             * 画像をnew Image()ではなくfetchで取得するメリットとしては
             * GET以外が使えることやエラー処理がしやすいことが挙げられる。
             */
            const getImageBlob = async imageUrl => {
                const request = new Request(imageUrl, {
                    method: "GET",
                    keepalive: true
                });
                display(`keepalive = ${request.keepalive}`);
                const response = await fetch(request);
                if (!response.ok) {
                    throw new Error(`Failed loading image:${response.statusText}(${response.status})`);
                }
                return response.blob();
            };
            
            const getImage = imageUrl => {
                return new Promise(async (resolve, reject) => {
                    const img = new Image();
                    try {
                        const blob = await getImageBlob(imageUrl);
                        const url = URL.createObjectURL(blob);
                        img.onload = () => {
                            URL.revokeObjectURL(url);
                            console.log(`revoked ${url}`);
                            resolve(img);
                        };
                        img.onerror = reject;
                        img.src = url;
                    } catch(err) {
                       reject(err); 
                    }
                });
            };
            
            runner.addEventListener("click", async () => {
                try {
                    /**
                     * 同じリソースのBlobから生成したBlobURLを参照する既存のimgが
                     * ページから削除されていないと，BlobURLを毎度revokeしたとしても
                     * img追加時にエラーになってしまう。
                     * imgがページに残っているとrevokeできないのか？
                     */
                    resetArea();
                    const img = await getImage("samplestar.png");
                    resultArea.appendChild(img);
                } catch(err) {
                    display(err.message);
                }
            });
            
            clearer.addEventListener("click", resetArea);
        },
        readableStreamSample() {
            const base = doc.querySelector(".readablestream-sample"),
                runner = base.querySelector(".runner"),
                clearer = base.querySelector(".clearer"),
                resultArea = base.querySelector(".result-area");
                
            const readImage = async (url, consumer) => {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                if (!response.body) {
                    throw new Error("Response body is not implemented");
                }
                // response.bodyはReadableStream。
                // このReadableStreamを介して画像を読み込むとUint8Arrayが得られる。
                const reader = response.body.getReader();
                try {
                    while (true) {
                        const {done, value} = await reader.read();
                        if (done) {
                            break;
                        }
                        consumer(value);
                    }
                } finally {
                    // 呼ぶ必要があるかどうかは不明。
                    reader.releaseLock();
                }
                // 将来的には以下のコードでも動作するようになるはずである。
                //for await (const chunk of response.body) {
                //    consumer(chunk);
                //}
            };    
                
            runner.addEventListener("click", async () => {
                const consumeImage = chunk => {
                    resultArea.innerHTML += `Readed: ${chunk.length} byte<br />`;
                    const blob = new Blob([ chunk ], { type: "image/png" });
                    const img = doc.createElement("img");
                    const blobUrl = URL.createObjectURL(blob);
                    img.onload = () => {
                        resultArea.appendChild(img);
                        // revokeしてもimgがDOMに残っている限りimgを追加できない。
                        URL.revokeObjectURL(blobUrl);
                    };
                    img.src = blobUrl;
                };
                await readImage("samplestar.png", consumeImage);
            });    
                
            clearer.addEventListener("click", () => resultArea.innerHTML = "");
        },
        readableStreamIterationSample() {
            const base = doc.querySelector(".readablestream-iteration-sample"),
                resultArea = base.querySelector(".result-area"),
                bound = base.querySelector(".bound"),
                size = base.querySelector(".size"),
                runner = base.querySelector(".runner"),
                clearer = base.querySelector(".clearer");
                
            const streamAsyncGenerator = async function* (readableStream) {
                const reader = readableStream.getReader();
                try {
                    while (true) {
                        // readにバイトサイズを指定して少しずつレスポンスを読みたいが
                        // readは引数を取らない。
                        const {done, value} = await reader.read();
                        if (done) {
                            return;
                        }
                        yield value;
                    }
                } finally {
                    reader.releaseLock();
                }
            }; 
            
            const Uint8ArrayToString = array => {
                let s = [];
                for (let i = 0, len = array.byteLength; i < len; i++) {
                    s.push(String.fromCharCode(array[i]));
                }
                return s.join("");
            };
              
            runner.addEventListener("click", async () => {
                const url = `/webcise/RandomNumber?bound=${parseInt(bound.value)}`;
                const response = await fetch(url);
                if (!response.body) {
                    resultArea.innerHTML = "Response body is not enable <br />";
                    return;
                }
                let count = 0, 
                    limit = parseInt(size.value);
                for await (const chunk of streamAsyncGenerator(response.body)) {
                    console.log(chunk);
                    // Responseを2回読むことになるので以下のコードはエラーになる。
                    //console.log(await response.json());
                    //// Response.bodyが既に使われているとcloneもエラーになる。
                    //console.log(await (response.clone()).json());
                    let jsonStr = Uint8ArrayToString(chunk);
                    console.log(jsonStr);
                    const json = JSON.parse(jsonStr);
                    resultArea.innerHTML += `${json.result}<br />`;
                }
            });
            
            clearer.addEventListener("click", () => {
                resultArea.innerHTML = "";
            });
        }
	};

	const init = () => {
		Object.values(funcs).map(f => f(g));
	};

	win.addEventListener("DOMContentLoaded", init);
})(window, document, goma);
