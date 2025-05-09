(function(win, doc) {
	"use strict";

	var arrayNS = {},
		sampleArray = [1, 2, 3, 4, 5, 6, 7, 8, 9];

	var resArea = doc.getElementById("ArrayResultArea");

	var sampleArgs = {
		addAll : [sampleArray, ["A", "B", "C"]],
		sparseArray : [sampleArray, 5]
	};

	arrayNS.addAll = function(ary, eles) {
		Array.prototype.push.apply(ary, eles);
		return ary;
	};

	/**
	 * deleteしてもlengthは変化無し。
	 * indexの位置が疎になる。
	 */
	arrayNS.sparseArray = function(ary, index) {
		delete ary[index];
		return ary;
	};

	var runners = doc.querySelectorAll(".RunArrayFunc");
	Array.prototype.forEach.call(runners, function(el) {
		el.addEventListener("click", function() {
			var funcName = el.value,
				args = sampleArgs[funcName];
			var func = arrayNS[funcName].bind(null, args);
			resArea.innerHTML = func().join(" ");
		});
	});

}(window, document));