(function(doc, m) {

	var resultArea = m.ref("EventInfoArea"),
		emphasisStroke = "EmphasisStroke",
		emphasisFill = "EmphasisFill";
		
	var RESET_SECONDS = 2000;

	function resetContainerStyle(target, className) {
		if (target && className) {
			target.classList.remove(className);
		} else {
			var targets = doc.querySelectorAll(".SampleEventContainer");
			Array.prototype.forEach.call(targets, function(ele) {
				var allClass = [emphasisStroke, emphasisFill];
				allClass.forEach(function(cls) {
					ele.classList.remove(cls);
				});
			});
		}
	}

	function resetStyle(target, className) {
		setTimeout(function() {
			resetContainerStyle(target, className);
		}, RESET_SECONDS);
	}

	function changeContainerFill(evt) {
		var target = evt.target;
		target.classList.add(emphasisFill);
		resetStyle(target, emphasisFill);
	}

	function changeContainerStroke(evt) {
		var target = evt.target;
		m.log(target);
		m.println(resultArea, target.id, true);
		target.classList.add(emphasisStroke);
		resetStyle(target, emphasisStroke);
	}

	function enableCapture() {
		return m.ref("EnableEventCapture").checked;
	}

	(function initialize() {
		var parentContainer = m.ref("ParentEventContainer");
		
		m.addListener(m.ref("EventListenerSetter"), "click", function() {
			/**
			 * addEventListenerであれば何度実行しても同じイベントリスナは
			 * 1回しか追加されない。attachEventは呼び出した回数だけ追加されてしまう。
			 */
			var capture = enableCapture();
			m.addListener(parentContainer, "mousemove", changeContainerStroke, capture);
			m.addListener(parentContainer, "mousedown", changeContainerFill, capture);
		});

		m.addListener(m.ref("ClearEventInfoArea"), "click", function() {
			resetContainerStyle();
			var capture = enableCapture();
			m.removeListener(parentContainer, "mousemove", changeContainerStroke, capture);
			m.removeListener(parentContainer, "mousedown", changeContainerFill, capture);
			resultArea.value = "";
		});
	}());

}(document, my));
