(function(win, doc) {
	"use strict";

	var bindNS = {};

	var area = doc.getElementById("BindResultArea");

	function log(txt) {
		//console.log(txt);
		area.innerHTML = txt;
	}

	/**
	 * 抽象的な関数を定義し，bindに渡す引数によって
	 * 具象的な関数を再定義する。
	 * 
	 */
	function func1(y, z) {
		return this.x + y + z;
	}

	function init() {
		bindNS.log = log;
		/* 配列は部分適用時に文字列に変換される。 */
		bindNS.fnArray = func1.bind({x : 1}, [2, 3], 10);
		bindNS.fnNumber = func1.bind({x : 1}, 2, 3);
	}

	init();

	win.bindNS = bindNS;

}(window, document));