((win, doc, g) => {
	"use strict";

	const funcs = {
		focusSample() {
			const base = ".focus-sample ",
				capEle = doc.querySelector(base + ".enable-focus-events-capture");
				
			const onFocused = evt => {
				g.log(evt);
				const target = evt.target;
				target.classList.add("focused");
				target.classList.remove("unfocused");
			};
				
			const onUnfocused = evt => {
				g.log(evt);
				const target = evt.target;
				target.classList.add("unfocused");
				target.classList.remove("focused");
			};
			
			/**
			 * Rest parameterを使って定義された引数の直前の引数のデフォルトパラメータは
			 * 決して使われることはない。その引数を渡さなかった場合，Rest parameterの
			 * 一番最初の値が引数の値として割り当てられるからである。
			 * 従って以下のelementsの前のデフォルトパラメータは決して使われない。
			 */
			const addFocusListener = (isBubbles = false, capture = false, ...elements) => {
				/**
				 * Array.isArrayはNodeListを受け取った時にfalseを返す。
				 * NodeList等の「配列のようなオブジェクト」をそのまま使いたい時は
				 * Array.isArray以外の方法で判定しなければならない。
				 */
				//if (!Array.isArray(elements)) {
				//	elements = [elements];
				//}
				
				Array.of(...elements).forEach(ele => {
					if (isBubbles) {
						ele.addEventListener("focusin", onFocused, capture);
						ele.addEventListener("focusout", onUnfocused, capture);
					} else {
						ele.addEventListener("focus", onFocused, capture);
						ele.addEventListener("blur", onUnfocused, capture);
					}
				});
			};
			
			const clearFocusListener = capture => {
				const bubbleFormEle = doc.querySelector(base + ".focus-sample-form-with-bubbles"),
					noBubbleFormEle = doc.querySelector(base + ".focus-sample-form-without-bubbles");
				
				const bubbleEles = bubbleFormEle.querySelectorAll("input"),
					noBubbleEles = noBubbleFormEle.querySelectorAll("input");
					
				const elements = [bubbleFormEle, ...bubbleEles, noBubbleFormEle, ...noBubbleEles];
				
				elements.forEach(ele => {
					ele.removeEventListener("focusin", onFocused, capture);
					ele.removeEventListener("focusout", onUnfocused, capture);
					ele.removeEventListener("focus", onFocused, capture);
					ele.removeEventListener("blur", onUnfocused, capture);
				});
			};
			
			const appendFocusListener = capture => {
				const bubbleFormEle = doc.querySelector(base + ".focus-sample-form-with-bubbles"),
					noBubbleFormEle = doc.querySelector(base + ".focus-sample-form-without-bubbles");
				
				addFocusListener(true, capture, bubbleFormEle);
				addFocusListener(false, capture, noBubbleFormEle);
			};
			
			const init = capture => {
				/**
				 * captureの切り替え前に登録されたイベントリスナーを解除する。
				 * そのためにcaptureの真偽を逆にしている。
				 */
				clearFocusListener(!capture);
				
				appendFocusListener(capture);
			};
			
			capEle.addEventListener("click", evt => init(evt.target.checked));
				
			init(capEle.checked);
		},
		inputEventSample() {
			const base = ".input-event-sample ",
				sampleTextEle = doc.querySelector(base + ".sample-textarea");
			
			const onInput = evt => {
				g.log(evt);
				const target = evt.target;
				/**
				 * InputEvent発生のたびにスタイルを切り替える。
				 */
				target.classList.toggle("inputted");
			};
			
			sampleTextEle.addEventListener("input", onInput);
		},
		keyboardEventSample() {
			const base = ".keyboard-event-sample ",
				inputArea = doc.querySelector(base + ".keyboard-input-textarea"),
				outputArea = doc.querySelector(base + ".keyboard-output-textarea");
			
			const onKeydown = evt => {
				evt.preventDefault();
				g.log(evt);
				
				const key = evt.key.toLowerCase();
				if (key.length === 1) {
					outputArea.value += key;
				} else if (key === "backspace") {
					const s = outputArea.value;
					outputArea.value = s.slice(0, s.length - 1);
				} else {
					outputArea.value += `[${key}]`;
				}
			};
			
			inputArea.addEventListener("keydown", onKeydown);
		}
	};
	
	g.init(funcs);
	
})(window, document, goma);
