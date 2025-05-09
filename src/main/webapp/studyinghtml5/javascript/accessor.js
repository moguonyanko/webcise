(function(win, doc) {
	"use strict";

	var area = doc.getElementById("ResultAccessorArea"),
		inputNameEle = doc.getElementById("InputNameAccessorValue"),
		inputModeEle = doc.getElementById("InputModeAccessorValue"),
		inputOptionEle = doc.getElementById("InputOptionAccessorValue");

	function log(txt) {
		console.log(txt);
	}

	function print(txt) {
		area.value += txt + "\n";
	}

	var sample = (function() {
		/**
		 * アクセッサメソッドと異なるプロパティ名で
		 * 定義しないと再帰エラーになる。
		 */
		var _sample = {
			/* 参照されるプロパティ名は関数名と同じになる。 */
			get name() {
				print("called name getter");
				return this._name;
			},
			set name(name) {
				/**
				 * このスコープで未定義値を参照すると
				 * strictモードでなくてもエラーになる。 
				 */
				print("called name setter ... " + name);
				this._name = name;
			},
			get mode() {
				print("called mode getter");
				return this._mode;
			},
			set mode(mode) {
				print("called mode setter ... " + mode);
				this._mode = mode;
			}
		};

		/**
		 * アクセッサメソッドで参照するプロパティを
		 * 書き込み可，列挙不可，再定義不可として定義する。
		 */
		Object.defineProperties(_sample, {
			_name : {
				/**
				 * 「データプロパティ」で指定できるのは
				 * 以下の4つのプロパティである。
				 */
				value : "HOGE", writable : true, enumerable : false, configurable : false
			},
			_mode : {
				value : "normal", writable : true, enumerable : false, configurable : false
			},
			option : {
				get : function() {
					print("called option getter");
					return this._option;
				},
				set : function(option) {
					print("called option setter ... " + option);
					this._option = option;
				},
				/**
				 * 「アクセッサプロパティ」でget, set以外に
				 * 指定できるのはenumerabelとconfigurableのみ。
				 * writableやvalueを指定するとエラーになる。
				 */
				enumerable : false, configurable : false
			}
		});

		return _sample;
	}());

	function objectMethodTest() {
		/**
		 * Object.create(null)で生成したオブジェクトは
		 * prototypeプロパティを持たないので
		 * in演算子でプロパティの列挙を行う際にhasOwnProperty
		 * によるチェックを行う必要が無い。
		 * enumerableがfalseだと当然そのプロパティは
		 * 列挙されなくなる。
		 * オブジェクトリテラルによる擬似配列のlengthを
		 * 要素の列挙前に削除することがあったが，enumerableを
		 * falseにすればよかっただけである。
		 */
		var obj0 = Object.create(null);
		Object.defineProperty(obj0, "name", {
			value : "not writable and not configurable object0",
			writable : false,
			enumerable : true,
			configurable : false
		});

		/**
		 * writableがtrueであること以外はobj0, obj1と同じ
		 * オブジェクト属性になる。
		 */
		var obj1 = Object.create(null);
		obj1.name = "seal object1";
		Object.seal(obj1);

		/**
		 * obj0と同じオブジェクト属性になる。
		 */
		var obj2 = Object.create(null);
		obj2.name = "freeze object2";
		Object.freeze(obj2);

		var objs = [obj0, obj1, obj2];

		objs.forEach(function(o) {
			log(o);
			/**
			 * オブジェクトがオブジェクトリテラルや
			 * コンストラクタ関数で生成された時に
			 * オブジェクトのプロパティを列挙する場合は，
			 * Object.keysを使えば継承されたプロパティが
			 * 列挙されないため安全である。
			 */
			Object.keys(o).forEach(function(k) {
				print(k + " → " + o[k]);
				var desc = Object.getOwnPropertyDescriptor(o, k);
				Object.keys(desc).forEach(function(d) {
					print(d + " : " + desc[d]);
				});
			});
			//for(var prop in o){
			//	print(o[prop]);
			//}
		});
	}

	function init() {
	}

	init();

	win.accessorNS = {
		printName : function() {
			sample.name = inputNameEle.value;
			print(sample.name);
		},
		printMode : function() {
			sample.mode = inputModeEle.value;
			print(sample.mode);
		},
		printOption : function() {
			sample.option = inputOptionEle.value;
			print(sample.option);
		},
		dumpObject : function() {
			/* 各プロパティのgetterが2回ずつ呼び出される。 */
			log(sample);
			/* 以下は無視される。 */
			delete sample._name;
			delete sample._mode;
			delete sample.option;
		},
		objectMethodTest : objectMethodTest
	};

}(window, document));