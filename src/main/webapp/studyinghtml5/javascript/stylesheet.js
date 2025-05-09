(function(win, doc, m) {
	"use strict";

	var targetContainer = doc.querySelector(".stylesheet-sample-container"),
		sampleStyleSheet = m.ref("stylesheet-sample").sheet,
		styleResultArea = m.ref("style-result-area"),
		cssTextResultArea = m.ref("csstext-result-area"),
		checkPseudoElementStyle = m.ref("enable-pseudo-element-style");

	var pseudoElement = ":hover";

	var sectionStyle = "section { background-color: orange; }";

	function enablePseudoElement() {
		return checkPseudoElementStyle.checked;
	}

	function getElementComputedStyle(target) {
		var pseudo = null;

		if (enablePseudoElement()) {
			pseudo = pseudoElement;
		}

		var computedStyle = win.getComputedStyle(target, pseudo);

		return computedStyle;
	}

	function getCSSRulesInfo(styleTarget) {
		var rulesText = [],
			styleText = [];
		var computedStyle = getElementComputedStyle(styleTarget);

		for (var i = 0, len = sampleStyleSheet.cssRules.length; i < len; i++) {
			var rule = sampleStyleSheet.cssRules[i];
			rulesText.push(rule.cssText);
			/**
			 * CSSRuleのstyleプロパティはgetComputedStyleの戻り値と同じ
			 * CSSStyleDeclarationオブジェクトだが算出スタイルにはなっていない。
			 * デバッガ上はCSSStyleDeclarationはCSS2Propertiesと表される。
			 */
			var styleIndexes = Object.keys(rule.style);
			styleIndexes.forEach(function(index) {
				var stylePropertyName = rule.style[index];
				var stylePropertyValue = computedStyle[stylePropertyName];
				if (stylePropertyValue) {
					styleText.push(stylePropertyName + ":" + stylePropertyValue);
				}
			});
		}

		return {
			cssText : rulesText.join("<br />"),
			style : styleText.join("<br />")
		};
	}
	
	var styleSheetRuleIndexMap = {};

	function setEnableSectionStyle(enableStyle, index) {
		var rules = sampleStyleSheet.cssRules,
			styleIndex = null;

		if (enableStyle) {
			/**
			 * 同じスタイルは何度でも追加できてしまうので
			 * インデックスを保存しておいて回避する。 
			 */
			if(!(sectionStyle in styleSheetRuleIndexMap)){
				styleIndex = rules.length;
				/**
				 * 新しいルールをスタイルシートのルール群の
				 * 指定されたインデックスの位置に追加していく。
				 */
				sampleStyleSheet.insertRule(sectionStyle, styleIndex);
				styleSheetRuleIndexMap[sectionStyle] = styleIndex;
			}
		} else {
			/**
			 * 指定されたインデックスの位置のルールを削除する。
			 * 
			 * 対応するstyle要素をdisabledにするか対象の要素に別のclassを
			 * 設定するなどしてスタイルを切り替える方が簡単である。
			 */
			try {
				styleIndex = index;
				sampleStyleSheet.deleteRule(styleIndex);
				delete styleSheetRuleIndexMap[sectionStyle];
			} catch (err) {
				/**
				 * インデックスの値がルールのサイズより大きい場合はIndexSizeErrorになる。
				 */
				m.log(err);
			}
		}

		/* 処理したルールのインデックスを返す。 */
		return styleIndex;
	}

	(function() {
		m.addListener(m.ref("display-style-executer"), "click", function() {
			var cssRuleInfo = getCSSRulesInfo(targetContainer);
			m.println(cssTextResultArea, cssRuleInfo.cssText, true);
			m.println(styleResultArea, cssRuleInfo.style, true);
		}, false);

		m.addListener(m.ref("clear-style-result"), "click", function() {
			m.print(cssTextResultArea, "", true);
			m.print(styleResultArea, "", true);
		}, false);

		var sectionStyleIndex;

		m.addListener(m.ref("section-style-sheet-insert"), "click", function() {
			var index = setEnableSectionStyle(true);
			if(index){
				sectionStyleIndex = index;
			}
		}, false);

		m.addListener(m.ref("section-style-sheet-delete"), "click", function() {
			setEnableSectionStyle(false, sectionStyleIndex);
		}, false);
	}());

}(window, document, my));
