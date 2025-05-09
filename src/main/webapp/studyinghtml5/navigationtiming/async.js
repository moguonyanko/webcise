/**
 * 非同時スクリプト読み込み時の動作確認用スクリプトです。
 * 
 */

(function(m) {
	"use strict";

	(function() {

		m.log("asyncスクリプト");

		var message = "ここでコストの大きい非同期処理を行うと，" + 
			"DOMContentLoadedイベント完了時間と" +
			"loadイベント完了時間の差を大きくなる。";
		m.log(message);
		
		var readyState = document.readyState,
			stateLog = "document.readyState:" + readyState;
		m.log(stateLog);
		
		m.log("document.readyState:interactiveでdocument.write()を呼び出しても無視される。");
		document.write("<p>async test page</p>");
		document.write("<p>" + stateLog + "</p>");
		
		m.log("document.readyState:complete以降にdocument.write()を呼び出すとページが上書きされる。");

	}());

}(my));
