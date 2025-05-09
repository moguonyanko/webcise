(function (win, doc, m) {
	"use strict";
	
	function collectCSSVariables(){
		var styles = m.getStyles(doc.documentElement),
			varPrefix = "--";
		
		var result = [];
		for(var i = 0, len = styles.length; i < len; i++){
			var styleName = styles[i] || "";
			if(styleName.startsWith(varPrefix)){
				result.push(styleName);
			}
		}
		return result;
	}

	/**
	 * @todo
	 * documentElement以外からスタイルを得るようにすれば
	 * ルート要素に対して変数定義しなくてもCSS Variablesの値を
	 * スクリプト内で参照できるのだろうか？
     * 
     * Chrome48ではフラグ「試験運用版のウェブ プラットフォームの機能を有効にする」を
     * 有効にしてもCSS Variablesを参照することができない。
     * セレクタに対してCSS Variablesを指定できるのみである。
	 */
	function getCSSVariables(varName) {
		var value = m.getStyles(doc.documentElement).getPropertyValue(varName);
		return (value || "").trim();
	}

	function setCSSVariables(varName, value) {
		doc.documentElement.style.setProperty(varName, value);
	}

	function viewCSSVariables(viewer, varNames) {
		var result = [];
		varNames.forEach(function (name) {
			result.push(name + ":" + getCSSVariables(name));
		});
		
		var resultText = result.join("\n");
		if(resultText){
			m.println(viewer, resultText);
		}
	}

	function init() {
		var viewer = m.ref("css-var-viewer");

		m.clickListener("exec-css-var-view", function () {
			var usedVariables = collectCSSVariables();
			viewCSSVariables(viewer, usedVariables);
		});

		m.clickListener("exec-css-var-clear", function () {
			m.clear(viewer);
		});

		m.clickListener("exec-css-var-set", function (evt) {
			var varName = evt.target.value;
			setCSSVariables(varName, "red");
		});
	}

	init();
}(window, document, my));
