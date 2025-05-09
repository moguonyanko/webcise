(function (win, doc, m) {
	"use strict";

	var canvas = doc.getElementById("WorkerCanvas"),
		g = canvas.getContext("2d");

	var width = parseInt(canvas.width),
		height = parseInt(canvas.height),
		arcSize = 50;

	var fibResult = doc.getElementById("FibResult");

	var start = win.performance.now();

	function getParallelType() {
		var types = doc.getElementsByName("ParallelType");
		for (var i = 0; i < types.length; i++) {
			if (types[i].checked) {
				return types[i].value;
			}
		}

		return null;
	}

	function runWorker(func, arg) {
		var worker = new Worker("worker.js");
		worker.onmessage = function (evt) {
			func(evt.data);
		};
		/**
		 * 複製できないプロパティ(例：関数)を持つオブジェクトを
		 * postMessageの引数として渡すことはできない。
		 */
		worker.postMessage({
			handler: getParallelType(),
			arg: arg
		});
	}

	function enableWorkers() {
		var ele = doc.getElementById("EnableWorkers");
		return ele.checked;
	}

	function draw(delta) {
		var left = (delta * 0.1) % (width - arcSize);

		g.fillStyle = "#0066CC";
		g.setTransform(1, 0, 0, 1, left, 0);
		g.clearRect(-width, 0, width * 2, height);
		g.beginPath();
		g.arc(arcSize, arcSize, arcSize, 0, Math.PI * 2, false);
		g.fill();
	}

	/**
	 * Workerの処理が重くても処理が止まらないことをテストするための関数。
	 * requestAnimationFrameを使って描画を繰り返す。
	 */
	function drawCircle(now) {
		draw(now - start);
		win.requestAnimationFrame(drawCircle);
	}

	var runWorker = {
		fib: function () {
			var fibParam = parseInt(doc.getElementById("FibInput").value);
			fibResult.value = "計算中...";
			if (!isNaN(fibParam)) {
				if (enableWorkers()) {
					var worker = new Worker("worker.js");
					worker.onmessage = function (evt) {
						fibResult.value = evt.data.result;
					};
					/**
					 * 複製できないプロパティ(例：関数)を持つオブジェクトを
					 * postMessageの引数として渡すことはできない。
					 * 例えば関数を渡すとDataCloneErrorになる。
					 */
					worker.postMessage({
						handler: "fib",
						arg: fibParam
					});
				} else {
					var res = fib(fibParam);
					fibResult.value = res;
				}
			} else {
				fibResult.value = "入力値が正の整数ではありません。";
			}
		},
		download: function () {
			var worker = new Worker("worker.js");

			worker.onmessage = function (evt) {
				var data = evt.data,
					txt = data.time + ":" + data.result.name;
				fibResult.value = txt;
			};

			var pollingInterval = 1000,
				pollingLimit = 5;

			/* ダウンロードは定期的に繰り返される。 */
			worker.postMessage({
				handler: "download",
				arg: pollingInterval
			});

			/* 一定時間後にworkerを終了する。workerは再利用不可。 */
			setTimeout(function () {
				worker.terminate();
			}, pollingInterval * pollingLimit);
		},
		buffer: function () {
			var imgData = g.getImageData(0, 0, width, height),
				buf = imgData.data.buffer;

			var worker = new Worker("worker.js");
			worker.onmessage = function (evt) {
				var snapCanvas = doc.getElementById("SnapshotCanvas"),
					g2 = snapCanvas.getContext("2d"),
					w = parseInt(snapCanvas.width),
					h = parseInt(snapCanvas.height),
					imgData2 = g2.getImageData(0, 0, w, h);

				var data = evt.data,
					view = new Uint8ClampedArray(data);

				//Array.prototype.forEach.call(imgData2.data,
				//	function (element, index) {
				//		imgData2.data[index] = view[index];
				//	});

				for (var index = 0, len = view.length; index < len; index++) {
					imgData2.data[index] = view[index];
				}

				g2.putImageData(imgData2, 0, 0);
			};

			worker.postMessage(buf, [buf]);
		}
	};

	/**
	 * 図形の描画と他の処理を並列処理する。
	 */
	function handleParallelEvent(evt) {
		drawCircle(start);

		var type = getParallelType(),
			parallelFunc = runWorker[type];

		parallelFunc();
	}

	function addEventListener() {
		fibResult.value = "";
		var runner = doc.getElementById("ParallelRunner");
		runner.addEventListener("click", handleParallelEvent, false);
	}

	function init() {
		addEventListener();
	}

	init();

}(window, document, my));
