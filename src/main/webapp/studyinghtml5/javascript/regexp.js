(function(win, doc) {
	"use strict";

	var area = my.ref("RegExpResultArea"),
		sampleValueEle = my.ref("RegExpSampleValue"),
		samplePatternEle = my.ref("RegExpSamplePattern"),
		sampleFlagEles = my.refs("RegExpSampleFlag");

	function getFlag() {
		var results = Array.prototype.map.call(
			sampleFlagEles,
			function(ele) {
				if (ele.checked) {
					return ele.value;
				} else {
					return "";
				}
			});

		return results.join("");
	}

	function getPattern(opt_flag) {
		var flag = opt_flag || getFlag();
		return new RegExp(samplePatternEle.value, flag);
	}

	function getValue() {
		return sampleValueEle.value;
	}

	function match(value, pattern) {
		return value.match(pattern);
	}

	function split(value, pattern) {
		return value.split(pattern);
	}

	win.regexpNS = {
		match : function() {
			var res = match(getValue(), getPattern());
			my.log(res);
			my.println(area, res);
		},
		split : function() {
			var res = split(getValue(), getPattern());
			my.log(res);
			my.println(area, res);
		}
	};

}(window, document));