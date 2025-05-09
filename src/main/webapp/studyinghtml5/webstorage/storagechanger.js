(function(win, doc, m) {
	"use strict";

	var upperBtn = m.ref("UpdateStorage"),
		saveBtn = m.ref("SaveStorage"),
		removeBtn = m.ref("RemoveStorage"),
		keyNameEles = m.refs("localstorage-key-names"),
		storageNameEles = m.refs("storage-type-names");

	function getKeyName() {
		return m.selected(keyNameEles);
	}

	function getStorageType() {
		return m.selected(storageNameEles);
	}

	function callStorage() {
		var storageType = getStorageType();

		if (storageType in win) {
			var storage = win[storageType],
				methodName = arguments[0];

			if (methodName) {
				/* StorageAPIに渡す引数のうちメソッド名は削除する。 */
				var args = [].slice.call(arguments, 1);
				return storage[methodName].apply(storage, args);
			}
		} else {
			throw new Error("Undefined storage type:" + storageType);
		}
	}

	function KeyValue(keyName, initValue) {
		this.key = keyName;
		this.initValue = initValue || null;
		this.value = this.initValue;

		/* keyは不変(読み取り専用かつ編集不可)にする。 */
		m.freeze(this, ["key"]);
	}

	KeyValue.prototype = {
		getKey : function() {
			return this.key;
		},
		setValue : function(newValue) {
			this.value = newValue;
		},
		getValue : function() {
			return this.value;
		},
		toJSON : function() {
			var json = {};

			var val = this.getValue();
			if (val instanceof KeyValue) {
				json[this.getKey()] = val.toJSON();
			} else {
				json[this.getKey()] = val;
			}

			return json;
		},
		update : m.noop,
		save : function() {
			var key = this.getKey(),
				value = this.getValue();

			/**
			 * setItemできる値は文字列のみ。
			 */
			callStorage("setItem", key, value);
		},
		load : function() {
			var key = this.getKey();

			return callStorage("getItem", key);
		},
		remove : function() {
			var key = this.getKey();

			/**
			 * removeItemするとnullがセットされる。 
			 * undefinedではない。
			 */
			callStorage("removeItem", key);

			this.reset();
		},
		reset : function() {
			this.setValue(this.initValue);
		}
	};

	function CountKeyValue(initValue) {
		var value = parseInt(initValue);
		if (isNaN(value)) {
			value = 0;
		}

		KeyValue.call(this, "count", value);
	}
	m.extend(KeyValue, CountKeyValue);

	CountKeyValue.prototype.update = function() {
		var nowValue = this.getValue();
		this.setValue(nowValue + 1);
	};

	function getNow(){
		return win.performance.now();
	}

	function TimeKeyValue(initValue) {
		var value = initValue || getNow();
		KeyValue.call(this, "time", value);
	}
	m.extend(KeyValue, TimeKeyValue);
	
	TimeKeyValue.prototype.update = function(){
		this.setValue(getNow());
	};

	var keyValuePair = {
		count : new CountKeyValue(),
		time : new TimeKeyValue()
	};

	function clearStorage() {
		callStorage("clear");

		for (var name in keyValuePair) {
			keyValuePair[name].reset();
		}
	}

	function getKeyValue() {
		var keyName = getKeyName(),
			pair = keyValuePair[keyName];

		return pair;
	}

	(function() {
		m.addListener(upperBtn, "click", function() {
			getKeyValue().update();
		}, false);

		m.addListener(saveBtn, "click", function() {
			getKeyValue().save();
		}, false);

		m.addListener(removeBtn, "click", function() {
			getKeyValue().remove();
		}, false);

		m.addListener(m.ref("storage-clearer"), "click", clearStorage, false);
	}());

}(window, document, my));
