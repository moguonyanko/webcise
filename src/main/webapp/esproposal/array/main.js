((win, doc, g) => {
	"use strict";
	
	const testCreateArray = () => {
		const a = g.Array.create({size: 10, initial: 0});
		a[5] = "HELLO";
		console.log(a);
	};
	
	/**
	 * DOMにアクセスしない即ちECMAScriptで完結できるコードは分離する。
	 */
	const getRandomValues = ({seed, size, initial} = {}) => {
		/**
		 * Arrayでは引数の値のサイズを持つ配列が返される。この時各要素はnullで
		 * 初期化される(Firefoxの場合)。しかし配列は空として扱われるので巡回すること
		 * ができない。そこでArray.prototype.fillを使い適当な値(ここではゼロ)を
		 * 割り当てることで空ではない巡回できる配列を作っている。
		 * Array.ofでは引数に渡した値を要素として持つ配列が返される。
		 */
		const values = g.Array.create({size, initial})
			.map(() => parseInt(Math.random(seed) * seed));
		
		return values;
	};
	
	const funcs = {
		arrayIncludesSample() {
			const base = ".array-includes-sample ";
			const { runner, clearer, output } = g.getCommonUI(base);
			const input = g.select(base + ".target");
			const initializer = g.select(base + ".initializer");
			const fromIndexEle = g.select(base + ".from-index");
			
			const seed = 100;
			const srcSize = 10;
			const initial = 0;
		
			let values;
		
			const initSrc = size => {
				const src = g.select(base + ".source");
				values = getRandomValues({seed, size, initial});
				src.innerHTML = values.map(v => " " + v).toString();
			};
			
			initializer.addEventListener("click", () => initSrc(srcSize));
			
			runner.addEventListener("click", () => {
				const target = parseInt(input.value);
				const fromIndex = parseInt(fromIndexEle.value);
				if (!isNaN(target) && !isNaN(fromIndex)) {
					/**
					 * 検索開始インデックスに負の値が渡された場合，配列の要素数と
					 * インデックスの和を実際の検索開始インデックスとして検索を行う。
					 * 例えば要素数が10で渡された検索開始インデックスが-1だった場合，
					 * 実際の検索開始インデックスは9になる。-1を渡したからといって
					 * 最後の要素を調べた後最初の要素に戻って検索を続行したりはしない。
					 */
					const result = values.includes(target, fromIndex);
					g.println(output, result);
				}
			});
			
			clearer.addEventListener("click", () => g.clear(output));
			
			initSrc(srcSize);
		}
	};
	
	const init = () => {
		testCreateArray();	
		g.init(funcs);
	};
	
	win.addEventListener("DOMContentLoaded", init);
})(window, document, goma);
