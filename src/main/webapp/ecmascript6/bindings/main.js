((win, doc, g) => {
	
	const getElements = base => {
		const runner = doc.querySelector(base + " .runner"),
			clearer = doc.querySelector(base + " .clearer"),
			output = doc.querySelector(base + " .output"); 
				
		return { runner, clearer, output };
	};
	
	const samples = {
		blockLevelSample() {
			const base = ".block-level-sample ";
			const { runner, clearer, output } = getElements(base);
			
			const enableStrictMode = () => {
				const ele = doc.querySelector(base + ".check-strict");
				return ele.checked;
			};
			
			function func() {
				if (f() !== 1) {
					return "NG1";
				}
				function f() {
					console.log("return 1");
					return 1;
				}
				{
					if (f() !== 2) {
						return "NG2";
					}
					function f() {
						console.log("return 2");
						return 2;
					}
					if (f() !== 2) {
						return "NG3";
					}
				}
				/**
				 * strictモードではないのでここで呼び出すfがブロック内に宣言したfで
				 * 上書きされている。結果としてfalseが返される。
				 */
				if (f() !== 1) {
					return "NG4";
				}
				return "OK";
			}
			
			function funcWithStrictMode() {
				"use strict";
				if (f() !== 1) {
					return "NG1";
				}
				function f() {
					console.log("return 1");
					return 1;
				}
				{
					/**
					 * まだブロック内fの宣言前だが，ここのf呼び出しはブロック内のfを
					 * 呼び出す。
					 */
					if (f() !== 2) {
						return "NG2";
					}
					function f() {
						console.log("return 2");
						return 2;
					}
					if (f() !== 2) {
						return "NG3";
					}
					/**
					 * ブロック外のfを参照するには事前に別の変数にブロック外fの参照を
					 * 保存しておくしかないかもしれない。
					 */
				}
				/**
				 * strictモードなのでブロック外に宣言したfが先頭の呼び出しと同様に
				 * 呼び出される。
				 */
				if (f() !== 1) {
					return "NG4";
				}
				return "OK";
			}
			
			runner.addEventListener("click", () => {
				let result;
				if (enableStrictMode()) {
					result = funcWithStrictMode();
				} else {
					result = func();
				}
				output.innerHTML += result + "<br />";
			});
			
			clearer.addEventListener("click", () => {
				output.innerHTML = "";
			});
		}
	};
	
	win.addEventListener("DOMContentLoaded", 
		() => Object.values(samples).forEach(f => f()));
})(window, document, goma);
