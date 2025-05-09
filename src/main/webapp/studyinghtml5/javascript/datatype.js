(function(win, doc) {
	"use strict";

	var resultArea = my.ref("ResultDataTypeArea"),
		typeChecker = my.ref("InstanceChecker");

	function checkInstance() {
		/**
		 * +演算子がinstanceof演算子より先に評価されないように
		 * instanceof演算子の式を()で囲むことは必須。
		 */
		var result = [
			"1 instanceof Number ... " + (1 instanceof Number),
			"Number(1) instanceof Number ... " + (Number(1) instanceof Number),
			"new Number(1) instanceof Number ... " + (new Number(1) instanceof Number),
			"\"\" instanceof String ... " + ("" instanceof String),
			"String(\"\") instanceof String ... " + (String("") instanceof String),
			"new String(\"\") instanceof String ... " + (new String("") instanceof String)
		];

		return result.join("\n");
	}

	function init() {
		typeChecker.addEventListener("click", function() {
			var checkResult = checkInstance();
			my.println(resultArea, checkResult);
		}, false);
	}

	init();

}(window, document));