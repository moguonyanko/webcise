((win, doc, g) => {
	"use strict";

	const samples = {
		paddingStringSample() {
			const base = ".padding-string-sample ";
			const { runner, clearer, output } = g.getCommonUI(base);

			/**
			 * 関数側の引数名が適切に命名されていれば引数名を指定して
			 * 呼び出す側のコードも読みやすくなるはずである。
			 */
			const pad = ({ source, length = 0, side, padding = "" } = {}) => {
				side = side.toLowerCase();
				const l = parseInt(length);
				const p = padding || "";

				if (length < 0) {
					throw new Error(`length must not nagative number:${length}`);
				}

				if (side === "start") {
					return source.padStart(l, p);
				} else if (side === "end") {
					return source.padEnd(l, p);
				} else {
					return source;
				}
			};

			runner.addEventListener("click", () => {
				const source = g.select(base + ".sample-input").value,
					padding = g.select(base + ".sample-padding-text").value,
					length = g.select(base + ".sample-length").value;

				const sideEles = Array.from(g.refs("padding-side")).filter(ele => ele.checked);
				if (sideEles.length > 0) {
					const side = sideEles[0].value;
					/**
					 * padの宣言で定義されている順序を気にせずに引数を渡すことができるが，
					 * 定義されている引数名と渡す引数の引数名が一致している必要はある。
					 * { padding } は { padding: padding } の省略形だからである。
					 */
					const result = pad({ side, padding, length, source });
					g.println(output, result);
				}
			});

			clearer.addEventListener("click", () => g.clear(output));
		}
	};

	win.addEventListener("DOMContentLoaded",
		Object.values(samples).forEach(s => s(g)));
})(window, document, goma);
