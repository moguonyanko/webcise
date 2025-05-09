(function(win, doc, m) {
	"use strict";
	
	var pageLoadedTime;

	var timeView = m.ref("TimingView"),
		naviView = m.ref("NavigationTypeView"),
		highView = m.ref("HighResolutionTimeView"),
		userWaitedTimeView = m.ref("UserWaitedTimeResultArea"),
		domLoadedTimeView = m.ref("DomLoadedTimeResultArea");

	function formatTimingInfo(info, opt_separator) {
		var txt = [];
		txt.push(info.name);
		txt.push(opt_separator || ":");
		txt.push(info.value);

		var infoValue = txt.join("");

		return infoValue;
	}

	function handleTimingEvent(evt) {
		var timing = win.performance.timing,
			fragment = doc.createDocumentFragment(),
			timeContentId = "TimeContent";
		for (var name in timing) {
			if (typeof timing[name] !== "function") {
				var info = formatTimingInfo({
					name : name,
					value : timing[name]
				});
				var txtNode = doc.createTextNode(info),
					newLine = doc.createElement("br");
				fragment.appendChild(txtNode);
				fragment.appendChild(newLine);
			}
		}

		var cont = doc.createElement("div");
		cont.setAttribute("id", timeContentId);
		cont.appendChild(fragment);
		if (m.ref(timeContentId)) {
			timeView.replaceChild(cont, m.ref(timeContentId));
		} else {
			timeView.appendChild(cont);
		}
	}

	var naviTypes = (function() {
		var navi = win.performance.navigation;

		var types = {};

		types[navi.TYPE_NAVIGATE] = "アドレスバーまたはリンクから訪問された。";
		types[navi.TYPE_RELOAD] = "ページが再読み込みされた。";
		types[navi.TYPE_BACK_FORWARD] = "履歴を戻ったか進んだ。";
		types[navi.TYPE_RESERVED] = "不明(予約)";

		return types;

	}());

	function handleNavigationEvent(evt) {
		var navi = win.performance.navigation,
			naviType = naviTypes[navi.type],
			redirectCount = navi.redirectCount;

		var info = naviType + " リダイレクト回数 -> " + redirectCount;

		var naviTypeNode = doc.createTextNode(info),
			naviCont = doc.createElement("div"),
			naviContId = "NavigationContent";

		naviCont.setAttribute("id", naviContId);
		naviCont.appendChild(naviTypeNode);

		var oldCont = m.ref(naviContId);
		if (oldCont) {
			naviView.replaceChild(naviCont, oldCont);
		} else {
			naviView.appendChild(naviCont);
		}
	}
	
	/**
	 * @description 
	 * High Resolution Timeの現在の経過時間を返します。
	 * Date.nowは整数値で表されるミリ秒を返しますが，この関数は
	 * 浮動小数点数で表されるマイクロ秒を返します。
	 * またその値は常にシステム時間とは独立し，一定の割合で増加します。
	 * https://developer.mozilla.org/ja/docs/Navigation_timing
	 */
	function getHighResolutionTimeNow(){
		return win.performance.now();
	}

	function handleHighResoutionTime(evt) {
		highView.innerHTML = getHighResolutionTimeNow();
	}
	
	function getTimingValue(name){
		var _name = (name || "").trim();
		
		if(_name in win.performance.timing){
			return win.performance.timing[_name];
		}else{
			throw new Error("Undefined timing name:" + name);
		}
	}
	
	function getPageLoadTime(){
		var naviStart = getTimingValue("navigationStart");
		/**
		 * pageLoadedTimeがPerformance.now()の値だと
		 * マイクロ秒からミリ秒を減算することになる。
		 * 結果として誤ったロード時間になる。
		 */
		return pageLoadedTime - naviStart;
	}
	
	function diplayPageLoadEndTime(){
		m.ref("PerformanceNowResultArea").value = Math.round(getHighResolutionTimeNow());
		/**
		 * loadEventEndはページの要素が全て解析完了するまではゼロを返す。
		 * すなわちページ表示中に実行されているスクリプト内では常にゼロになってしまう。
		 */
		m.ref("LoadEventEndResultArea").value = win.performance.timing.loadEventEnd;
	}
	
	function getDomLoadedTime(){
		var domLoading = getTimingValue("domLoading");
		var domComplete = getTimingValue("domComplete");
		return domComplete - domLoading;
	}
	
	function addEventListener() {
		win.addEventListener("load", handleTimingEvent, false);
		win.addEventListener("load", handleNavigationEvent, false);
		win.addEventListener("load", handleHighResoutionTime, false);
		
		m.addListener(m.ref("UserWatedTimeGetter"), "click", function(evt){
			var time = getPageLoadTime();
			m.println(userWaitedTimeView, time + "ミリ秒", true);
		}, false);
		
		m.addListener(m.ref("DomLoadTimeGetter"), "click", function(evt){
			var time = getDomLoadedTime();
			m.println(domLoadedTimeView, time + "ミリ秒", true);
		}, false);
		
		m.addListener(m.ref("LoadTimeGetter"), "click", function(evt){
			var domLoadedTime = getTimingValue("domContentLoadedEventEnd");
			var loadedTime = getTimingValue("loadEventEnd");
			m.println(m.ref("DomContentLoadedResultArea"), domLoadedTime, true);
			m.println(m.ref("LoadResultArea"), loadedTime, true);
		}, false);
	}
	
	function setPageLoadTime(){
		pageLoadedTime = Date.now();
	}

	function init() {
		addEventListener();
		setPageLoadTime();
		diplayPageLoadEndTime();
	}

	init();

}(window, document, my));
