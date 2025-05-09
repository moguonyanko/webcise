/**
 * 共有ライブラリの読み込みを試みる。
 * スクリプトの読み込みが完了するまでは処理が進まない(はず)。
 * 
 * importScriptsで読み込まれたスクリプトは
 * Chrome42やFirefox39，IE11でデバッグできない。
 * Workerコンストラクタ関数で読み込まれたスクリプトは
 * デバッグできそうに見える。
 */
self.importScripts("sharedlibrary.js");

function workerLibTest(args) {
	self.postMessage({
		sharedResult : self.myMath[args.operation].apply(null, args.values),
		sentence : args.sentence + ", Worker!"
	});
}

self.onmessage = function(evt) {
	workerLibTest(evt.data);
};
