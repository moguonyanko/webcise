((win, doc, g) => {
	"use strict";
	
	const samples = {
		unicodeMatchingSample(g) {
			const base = ".unicode-matching-sample ";
			const { runner, clearer, output } = g.getCommonUI(base);
			
			const getPattern = () => {
				/**
				 * 任意の1文字だけで構成されているかどうかをマッチングする。
				 * uフラグが無ければ「1文字だけ構成」＝「コードポイント1つだけ」
				 * という設定でマッチングが検索される。
				 */
				const p = "^.$";
				
				if (g.select(base + ".enable-u-flag").checked) {
					return new RegExp(p, "u");
				} else {
					return new RegExp(p);
				}
			};
			
			runner.addEventListener("click", () => {
				const textEle = g.select(base + ".test-target-text");
				
				if (textEle.value) {
					const c = textEle.value;
					const matches = c.match(getPattern());
					console.log(matches);
					output.innerHTML += matches + "<br />";
				} 
			});
			
			clearer.addEventListener("click", () => {
				output.innerHTML = "";
			});
		}
	};
	
	win.addEventListener("DOMContentLoaded", () => {
		Object.values(samples).forEach(sample => sample(g));
	});
})(window, document, goma);
