/**
 * 重い処理を行うテスト用のスクリプトです。
 * このスクリプト内でWindowオブジェクトを参照すると
 * エラーになります。
 */

/**
 * Windowオブジェクトの直下に保存されるように
 * このスクリプトが読み込まれれば，この関数は
 * 外部スクリプトから参照可能になる。
 */
function fib(n) {
	if (n <= 1) {
		return n;
	}

	return fib(n - 1) + fib(n - 2);
}

function pollingDownload(data) {
	var interval = parseInt(data.arg);
	
	var xhr = new XMLHttpRequest(),
		async = false;

	/* Worker内部では同期リクエストしてもWebページの動作をブロックしない。 */
	xhr.open("GET", "sample.json?" + Date.now(), async);
	xhr.send();
	if (xhr.status === 200) {
		/**
		 * JSONオブジェクトのメソッドでシリアライズできるオブジェクトであれば
		 * postMessageの引数に渡すことができる。
		 */
		self.postMessage({
			time: Date.now() || "時刻不明",
			result: JSON.parse(xhr.responseText)
		});
	}
	
	self.setTimeout(function(){
		pollingDownload(data);
	}, interval);
}

function changeGrayPixel(view, i) {
	var r = view[i],
		g = view[i + 1],
		b = view[i + 2],
		a = view[i + 3];

	var gray = 0.298912 * r + 0.586611 * g + 0.114478 * b;
	gray = parseInt(gray, 10);

	view[i] = gray;
	view[i + 1] = gray;
	view[i + 2] = gray;
	view[i + 3] = a;
}

/**
 * 以下の関数群は本来は各々のスクリプトに分けるべきである。
 */
var messageHandler = {
	fib: function (data) {
		var n = parseInt(data.arg);
		var result = fib(n);
		self.postMessage({
			result: result
		});
	},
	download: pollingDownload,
	buffer: function (buf) {
		var view = new Uint8ClampedArray(buf);
		
		/**
		 * 副作用が無いのでグレースケール変換できない。 
		 * またかなり遅くなる。
		 */
		//Array.prototype.forEach.call(view, changeGrayPixel);

		/* グレースケール変換 */
		for (var i = 0, len = view.length; i < len; i++) {
			/**
			 * Uint8ClampedArrayを使っているので固定サイズ(8ビット＝1バイト)単位で
			 * バッファを読む。
			 */
			var r = view[i],
				g = view[i + 1],
				b = view[i + 2],
				a = view[i + 3];

			var gray = 0.298912 * r + 0.586611 * g + 0.114478 * b;
			gray = parseInt(gray, 10);

			view[i] = gray;
			view[i + 1] = gray;
			view[i + 2] = gray;
			view[i + 3] = a;
		}

		self.postMessage(buf, [buf]);
	}
};

self.onmessage = function (evt) {
	var evtData = evt.data,
		handlerName = evtData.handler;

	if (handlerName) {
		var handler = messageHandler[handlerName];
		handler(evtData);
	} else {
		messageHandler.buffer(evtData);
	}
};
