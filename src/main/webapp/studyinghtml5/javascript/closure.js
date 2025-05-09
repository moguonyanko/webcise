(function (win, doc, m) {
	"use strict";

	var btns = doc.querySelectorAll(".ClosureButton"),
		sampleList = m.ref("closure-sample-list");

	function setCountListener() {
		for (var i = 0; i < btns.length; i++) {
			btns[i].onclick = (function (x) {
				return function () {
					/**
					 * このthisはクリックされたときのボタンを参照している。
					 */
					this.innerHTML = x + 1;
				};
			}(i));
		}
	}

	function setChangeListStyleListener(success) {
		var lis = sampleList.getElementsByTagName("li");

		for (var i = 0; i < lis.length; i++) {
			var li = lis[i];

			if (success) {
				li.onclick = (function (localI) {
					return function () {
						this.dataset.listValue = localI + 1;
					};
				}(i));
			} else {
				li.onclick = function () {
					/**
					 * ここのスコープチェーンは「生きている」。
					 * したがってiの最終的な値(lis.length)がlis.length個の
					 * イベントリスナのクロージャで共有される。
					 * 結果としてどのli要素であってもクリックされたときに
					 * data-list-value属性にiの最終的な値と同じ値が設定される。
					 * 
					 * setCountListenerのように関数でもう一回包むようにし，
					 * その関数に引数を渡したやれば，各クロージャが同じ生きている
					 * スコープチェーンを参照しなくなるので意図通りの動作になる。
					 */
					this.dataset.listValue = i;
				};
			}
		}
	}
	
	function resetListStyle(){
		var lis = sampleList.getElementsByTagName("li");
		
		Array.prototype.forEach.call(lis, function(el){
			el.dataset.listValue = "0";
			el.onclick = m.noop;
		});
	}

	(function () {
		setCountListener();
		/* 初めは正常なリスナを設定する。 */
		setChangeListStyleListener(true);
		m.addListener(m.ref("success-listener-setter"), "click", function(){
			resetListStyle();
			setChangeListStyleListener(true);
		}, false);
		m.addListener(m.ref("fail-listener-setter"), "click", function(){
			resetListStyle();
			setChangeListStyleListener(false);
		}, false);
	}());

}(window, document, my));
