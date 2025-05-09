(function(win, doc) {
	"use strict";

	var sample = doc.getElementById("ClassListSampleElement"),
		sampleClass = "NewClass",
		toggler = doc.getElementById("ToggleClass"),
		result = doc.getElementById("ClassListResult");

	function addEvent(ele, type, fn, cap) {
		ele.addEventListener(type, fn, cap);
	}

	function init() {
		result.value = "";

		sample.classList.add(sampleClass);

		for (var i = 0; i < sample.classList.length; i++) {
			result.value += sample.classList[i];
			result.value += "\n";
		}

		addEvent(toggler, "click", function() {
			sample.classList.toggle(sampleClass);
		});

		setTimeout(function() {
			sample.classList.remove(sampleClass);
		}, 3000);
	}

	init();


}(window, document));
