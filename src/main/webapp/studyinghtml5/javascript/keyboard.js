(function(m) {
	"use strict";

	var inputArea = m.ref("text-input-sample-area"),
		resultArea = m.ref("copy-text-area"),
		enableChar = m.ref("enable-input-char-diplay"),
		unicodeArea = m.ref("unicode-key-info");

	function InputFilter(pattern) {
		this.pattern = pattern;
	}

	InputFilter.prototype = {
		accept : function(char) {
			return this.pattern.test(char);
		}
	};

	var inputFilters = {
		alpha : new InputFilter(/[A-Za-z]/),
		digit : new InputFilter(/[0-9]/),
		alphadigit : new InputFilter(/[A-Za-z0-9]/)
	};

	function enableCharDisplay() {
		return enableChar.checked;
	}

	function emphasisText(txt) {
		return '<span class="emphasis-input">' + txt + '<span>';
	}

	function getKeyData(evt) {
		/**
		 * textInputイベントはdataプロパティに入力値を保持している。
		 * keypressイベントはkeyプロパティに入力値を保持しているか，
		 * charCodeプロパティまたはkeyCodeプロパティに入力値の文字コードを
		 * 保持している。
		 */
		var data = evt.data ||
			evt.key ||
			/**
			 * キーイベントのwhichはcharCodeやkeyCodeと同じ値が含まれている。
			 */
			String.fromCharCode((evt.charCode || evt.keyCode || evt.which));

		return data;
	}

	function simpleInput(txt, classSuffix) {
		classSuffix = classSuffix !== undefined ? classSuffix : "";
		return '<span class="simple-input' + classSuffix + '">' + txt + '<span>';
	}

	var decorators = {
		emphasis : emphasisText,
		simple : simpleInput
	};

	function getDecorator(type) {
		if (type in decorators) {
			return decorators[type];
		} else {
			return decorators.simple;
		}
	}

	function getFilteredInputListener(decoType) {
		return function(evt) {
			if (enableCharDisplay()) {
				m.log(evt);
				var filter = getInputFilter(),
					data = getKeyData(evt);
				if (filter.accept(data)) {
					var result = getDecorator(decoType)(data);
					m.print(resultArea, result);
				} else {
					if (evt.type !== "input") {
						m.println(resultArea, "入力できません", true);
					}
					m.prevent(evt);
				}
			}
		};
	}

	function getSimpleInputListener(simpleMode) {
		return function(evt) {
			if (enableCharDisplay()) {
				m.log(evt);
				var decorator = getDecorator("simple");
				var txt = decorator(getKeyData(evt), simpleMode);
				m.print(resultArea, txt);
			}
		};
	}

	function getInputFilter() {
		var filterEles = m.refs("input-char-filter"),
			filterName = "";
		for (var i = 0, len = filterEles.length; i < len; i++) {
			if (filterEles[i].checked) {
				filterName = filterEles[i].value;
				break;
			}
		}

		return inputFilters[filterName];
	}

	(function() {
		var emphasis = "emphasis";

		/**
		 * inputイベントは入力値の情報を持たない。
		 * inputイベントは入力が完了しないと発生しない。
		 * すなわち別のイベントリスナにおけるEvent.preventDefault呼び出しなどで
		 * 入力がキャンセルされるとinputイベントは発生しない。
		 */
		m.addListener(inputArea, "input", getFilteredInputListener(emphasis), false);

		/**
		 * Firefox37はtextInputイベントをサポートしない。
		 * textInputイベントのリスナでイベントをキャンセルすると入力を抑止できる。
		 */
		m.addListener(inputArea, "textInput", getFilteredInputListener(emphasis), false);

		/**
		 * DOM Level 3 Eventsで標準化されているのはtextinputの方。
		 * しかしChrome41でもFirefox37でもサポートされていない。
		 */
		m.addListener(inputArea, "textinput", getFilteredInputListener(emphasis), false);

		/**
		 * 入力された文字の情報はkeypressからしか取得できない。
		 * keypressイベントのリスナでイベントをキャンセルすることでも入力を抑止できる。
		 */
		m.addListener(inputArea, "keypress", getFilteredInputListener(emphasis), false);

		/**
		 * Chrome41の場合，keydownイベントとkeyupイベントのcharCodeとkeyCodeは
		 * keypressイベントのそれと異なる値になっている。
		 * 例えば英字であれば大文字の文字コードになっている。
		 * Firefox37ではkeypressイベントのプロパティと同じ値になっている。
		 */
		m.addListener(inputArea, "keydown", function(evt) {
			m.log(evt);
			/**
			 * keyIdentifierには押されたキーのUnicode文字列が保存されている。
			 * ただし拡張機能キーを押された時は別の値が保存されている。
			 * 例えばShiftキーを押した時はkeyIdentifierには「Shift」が保存されている。
			 * Firefox37にkeyIdentifierプロパティは存在しない。
			 * 拡張機能キーが押された時はChrome41のkeyIdentifierに
			 * 保存されていた値と同じ値がkeyプロパティに保存されている。
			 */
			m.println(unicodeArea, evt.keyIdentifier, true);
			var listener = getSimpleInputListener(0);
			listener(evt);
			/**
			 * keydownイベントをキャンセルするとTabキーによるフォーカスの変更等を
			 * 抑止できるが，keypressイベントが発生しなくなる。
			 */
			//m.prevent(evt);
		}, false);
		m.addListener(inputArea, "keyup", function(evt) {
			var listener = getSimpleInputListener(1);
			listener(evt);
		}, false);

		m.addListener(m.ref("clear-input-result"), "click", function() {
			resultArea.innerHTML = "";
			unicodeArea.innerHTML = "";
		}, false);
	}());
}(my));
