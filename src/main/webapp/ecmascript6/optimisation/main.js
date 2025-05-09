((win, doc, g) => {
	"use strict";
	
	const getElements = base => {
		const runner = doc.querySelector(base + ".runner"),
			clearer = doc.querySelector(base + ".clearer"),
			output = doc.querySelector(base + ".output"); 
				
		return { runner, clearer, output };
	};
	
	const getRecursiveSize = base => {
		const ele = doc.querySelector(base + ".recursive-size");
		return parseInt(ele.value);
	};
			
	const samples = {
		directRecursionSample() {
			const base = ".direct-recursion-sample ";
			const {runner, clearer, output} = getElements(base);
				
			const recursiveFunc = n => {
				if (n <= 0) {
					return "OK";
				}

				return recursiveFunc(n - 1);
			};
			
			runner.addEventListener("click", () => {
				let result;
				try {
					result = recursiveFunc(getRecursiveSize(base));
				} catch (err) {
					result = err.message;
				}
				output.appendChild(doc.createTextNode(result));
				output.appendChild(doc.createElement("br"));
			});
			
			clearer.addEventListener("click", () => {
				output.innerHTML = "";
			});
		},
		mutualRecursionSample() {
			const base = ".mutual-recursion-sample ";
			const {runner, clearer, output} = getElements(base);
			
			/**
			 * recursiveFuncAを呼び出すとrecursiveFuncAとrecursiveFuncBが交互に
			 * 再帰されながら呼び出される。従って再帰回数を1回ずらしてrecursiveFuncAを
			 * 2回呼び出せば，recursiveFuncAの戻り値とrecursiveFuncBの戻り値が
			 * それぞれ返ってくる。
			 */
			
			const recursiveFuncA = n => {
				if (n <= 0) {
					return "Hello";
				}
				
				/**
				 * この関数よりも後ろに定義された関数を呼び出しているが
				 * 巻き上げでエラーにはならず正常に呼び出せる。
				 * 巻き上げが許されないのはクラス宣言である。
				 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/class
				 */
				return recursiveFuncB(n - 1);
			};
			
			const recursiveFuncB = n => {
				if (n <= 0) {
					return "World";
				}
				
				return recursiveFuncA(n - 1);
			};
			
			runner.addEventListener("click", () => {
				let result;
				try {
					const size = getRecursiveSize(base);
					result = recursiveFuncA(size) + recursiveFuncA(size + 1);
				} catch (err) {
					result = err.message;
				}
				output.appendChild(doc.createTextNode(result));
				output.appendChild(doc.createElement("br"));
			});
			
			clearer.addEventListener("click", () => {
				output.innerHTML = "";
			});
		}
	};
	
	win.addEventListener("DOMContentLoaded", 
		() => Object.values(samples).forEach(f => f()));
})(window, document, goma);
