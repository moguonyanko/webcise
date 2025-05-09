(function(win, doc) {
	"use strict";

	function Sample() {
		this.value = 100;
	}

	Sample.prototype = {
		toString : function() {
			return "&lt;toString is not called if valueOf exists&gt;";
		},
		valueOf : function() {
			return this.value;
		}
	};

	function Sample2() {
	}

	Sample2.prototype = {
		toString : function() {
			return "&lt;valueOf is not implemented&gt;";
		}
	};

	function setValue(id, val) {
		my.ref(id).innerHTML = val;
	}

	var formulas = {
		DataTransformResult0 : function() {
			return "1" + 1;
		},
		DataTransformResult1 : function() {
			return 1 + "1";
		},
		DataTransformResult2 : function() {
			var x = "1";
			x++;
			return x;
		},
		DataTransformResult3 : function() {
			return true + false + null;
		},
		DataTransformResult4 : function() {
			return true + "false" + null;
		},
		DataTransformResult11 : function() {
			return Math.pow(null, false);
		},
		DataTransformResult5 : function() {
			return 1 + undefined;
		},
		DataTransformResult6 : function() {
			return 5 / 2;
		},
		DataTransformResult7 : function() {
			return 6.3 / 2.1;
		},
		DataTransformResult8 : function() {
			return 6.5 % -2.1;
		},
		DataTransformResult9 : function() {
			return new Sample() + 1;
		},
		DataTransformResult10 : function() {
			return new Sample2() + 1;
		},
		DataTransformResult12 : function() {
			return [] + 1;
		},
		DataTransformResult13 : function() {
			return [9] + 1;
		},
		DataTransformResult14 : function() {
			return Number("");
		},
		DataTransformResult15 : function() {
			return parseInt("");
		},
		DataTransformResult16 : function() {
			return Number([]);
		},
		DataTransformResult17 : function() {
			return parseInt([]);
		},
		DataTransformResult18 : function() {
			return Number([1]);
		},
		DataTransformResult19 : function() {
			return Number([1, 2]);
		},
		DataTransformResult20 : function() {
			var x = null;
			x++;
			return x;
		},
		DataTransformResult21 : function() {
			var x = 1,
				y = "1";

			return x == y;
		},
		DataTransformResult22 : function() {
			var x = 1,
				y = "2";

			return x < y;
		},
		DataTransformResult23 : function() {
			var x = 1,
				y = "1";

			return x - y;
		},
		DataTransformResult24 : function() {
			var x = 1,
				y = "one";

			return x - y;
		},
		DataTransformResult25 : function() {
			var x = 2,
				y = "2";

			return x * y;
		},
		DataTransformResult26 : function() {
			var x = 2,
				y = "2";

			return x / y;
		},
		DataTransformResult27 : function() {
			var x = null;

			return +x;
		},
		DataTransformResult28 : function() {
			var x = null;

			return -x;
		}
	};

	function setupFormulas() {
		for (var name in formulas) {
			var result = formulas[name]();
			setValue(name, result);
		}
	}

	function init() {
		setupFormulas();
	}

	init();

}(window, document));