(function(win, doc) {
	"use strict";

	var area = doc.getElementById("MultiListenerArea"),
		lisSiz = doc.getElementById("MultiListenerSize"),
		btn = doc.getElementById("MultiListenerSample"),
		clr = doc.getElementById("ClearListenerArea");

	function outputTime() {
		area.value += new Date().getTime() + "\n";
	}

	var listener = {
		type : "click",
		func : outputTime,
		capture : false
	};

	function getListenerSize() {
		var listenerSize = parseInt(lisSiz.value);
		return !isNaN(listenerSize) ? listenerSize : 0;
	}

	function resetListener() {
		var listenerSize = getListenerSize();

		for (var i = 0; i < listenerSize; i++) {
			btn.addEventListener(listener.type,
				listener.func, listener.capture);
		}
	}

	function clear() {
		area.value = "";

		var listenerSize = getListenerSize();

		for (var i = 0; i < listenerSize; i++) {
			btn.removeEventListener(listener.type,
				listener.func, listener.capture);
		}

		resetListener();
	}

	function init() {
		resetListener();
		clr.addEventListener("click", clear, false);
	}

	init();

}(window, document));