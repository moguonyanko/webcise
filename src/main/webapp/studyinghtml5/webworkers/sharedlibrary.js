/**
 * 読み込みテスト用の共有ライブラリ
 * 
 * Workerで使われるかどうかを気にせずに共有したいライブラリは
 * windowではなくselfを参照すること。
 * 
 * このスクリプトの最終行にある即時実行関数呼び出しの引数にthisを渡せば，
 * スクリプトがscript要素のsrc属性に指定された場合は読み込んだページの
 * Windowオブジェクトになり，Workerコンストラクタ関数の引数に指定された場合は
 * selfになるので都合が良い。
 * 
 * WorkerではDOMを参照できない。つまりDOM関連のライブラリはWorkerでは利用できない。
 * すなわちDOM関連の処理を扱っているスクリプトはwindowを即時実行関数呼び出しの引数に
 * 渡せばいい。
 */

(function(globalNS) {
	"use strict";
	
	function add(a, b) {
		return a + b;
	}

	function sub(a, b) {
		return a - b;
	}

	function mul(a, b) {
		return a * b;
	}

	function div(a, b) {
		return a / b;
	}

	/**
	 * 例えばこのスクリプトがWorkerとして読み込まれた場合は
	 * selfのプロパティとしてライブラリを公開される。
	 */
	globalNS.myMath = {
		add : add,
		sub : sub,
		mul : mul,
		div : div
	};
	
/* windowやselfではなくthisを渡す。 */
}(this));
