(function(win, doc) {
	"use strict";

	var resultArea = doc.getElementById("ConstructorResult");

	function display(content) {
		/**
		 * innerHTMLはサードパーティ製ライブラリとは組み合わせて
		 * 使わないこと。
		 * ライブラリによってページのDOMを勝手に編集されている場合，
		 * ライブラリが追加した要素もまとめて消してしまうなど意図しない
		 * 表示結果になることがある。
		 */
		resultArea.innerHTML = content;
	}

	function log(obj) {
		console.log(obj);
	}

	function dumpObject(obj) {
		var result = [
			"obj.constructor.name : " + obj.constructor.name
		];

		if (obj.prototype) {
			result.push("obj.prototype.constructor.name : " + obj.prototype.constructor.name);
		} else {
			result.push("obj.prototype : " + obj.prototype);
		}

		for (var prop in obj) {
			result.push(prop + " : " + obj[prop]);
		}

		display(result.join("<br />"));
	}

	function SuperClass(superName) {
		this.superName = superName;
	}

	SuperClass.prototype.getName = function() {
		return this.superName;
	};

	function SubClass(name, subName) {
		if (SubClass.superClass) {
			SubClass.superClass.call(this, name);
		}
		this.subName = subName;
	}

	/* @todo 継承できておらず呼び出されない？ */
	SubClass.prototype.getName = function() {
		var superName = SubClass.superClass.prototype.getName.apply(this, arguments);
		var subName = this.subName;

		return [superName, subName].join(" ");
	};

	function setSuperClass(superClass, subClass) {
		subClass.superClass = superClass;
	}

	function objectCreate(superClass, subClass) {
		subClass.prototype = Object.create(superClass.prototype);
	}

	function objectNew(superClass, subClass) {
		subClass.prototype = new superClass();
	}

	function functionBind(superClass, subClass) {
		/* bindが返す関数はコンストラクタではない。 */
		subClass.prototype = superClass.bind();
	}

	var inherits = {
		objectCreate : objectCreate,
		objectNew : objectNew,
		functionBind : functionBind
	};

	function doInherit(superClass, subClass) {
		var inheritFunc = null;

		var methodEles = doc.getElementsByName("inheritFuncs");
		for (var i = 0, size = methodEles.length; i < size; i++) {
			if (methodEles[i].checked) {
				inheritFunc = inherits[methodEles[i].value];
				break;
			}
		}

		if (inheritFunc) {
			inheritFunc(superClass, subClass);
			setSuperClass(superClass, subClass);
		}
	}

	function constructSubInstance(superName, subName) {
		doInherit(SuperClass, SubClass);
		var sub = new SubClass(superName, subName);
		return sub;
	}

	function dumpSubInstance() {
		var sub = constructSubInstance("Foo", "Taro");
		dumpObject(sub);
		log(sub);
	}

	function getSubName() {
		var sub = constructSubInstance("Foo", "Taro");
		display("SubName : " + sub.getName());
		log(sub);
	}

	win.constructorNS = {
		dumpSubInstance : dumpSubInstance,
		getSubName : getSubName
	};

}(window, document));