(function(win, doc, m) {
	"use strict";

	var workerEle = m.ref("worker-shared-library"),
		resultArea = m.ref("worker-shared-result"),
		testRunner1 = m.ref("shared-test-runner1"),
		testRunner2 = m.ref("shared-test-runner2"),
		messageEle = m.ref("worker-message"),
		lhsEle = m.ref("lhs-value"),
		rhsEle = m.ref("rhs-value"),
		clearer = m.ref("shared-test-clearer"),
		calcEles = m.refs("calc-type");

	function getMessage(){
		return messageEle.value;
	}
	
	function getOperationValues(){
		return [
			parseInt(lhsEle.value),
			parseInt(rhsEle.value)
		];
	}

	function printResult(data) {
		m.log(data);
		m.println(resultArea, data.sharedResult);
		m.println(resultArea, data.sentence);
	}
	
	function getOperation(){
		return m.selected(calcEles);
	}
	
	function postMessage(worker, callback) {
		worker.postMessage({
			sentence : getMessage(),
			values : getOperationValues(),
			operation : getOperation()
		});

		worker.onmessage = function(evt){
			callback(evt.data);
			/**
			 * Workerの処理時間が異常に長くなっている等の問題が無ければ
			 * 呼び出す必要は無い？ 
			 */
			worker.terminate();
		};
	}

	(function() {
		m.addListener(testRunner1, "click", function() {
			var bb = new Blob([workerEle.textContent], {
					type : "text/javascript"
				});

			var blobUrl = win.URL.createObjectURL(bb);

			postMessage(new Worker(blobUrl), function(data) {
				printResult(data);
				win.URL.revokeObjectURL(bb);
			});
		}, false);

		m.addListener(testRunner2, "click", function() {
			postMessage(new Worker("importtest.js"), function(data) {
				printResult(data);
			});
		}, false);
		
		m.addListener(clearer, "click", function(){
			m.clear(resultArea);
		}, false);
	}());

}(window, document, my));
