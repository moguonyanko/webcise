(function(win, doc, m) {
	"use strict";

	var resultArea = m.ref("ResultArea"),
		resultClearer = m.ref("result-clearer"),
		evtFrameContainer = m.ref("EventFrameContainer");

	var eventPageUrl = "storagechanger.html",
		eventPageId = "StorageChangerFrame",
		eventPageName = "StorageChanger",
		eventPageWidth = "800px",
		eventPageHeight = "600px";

	function outputLog(txt) {
		m.println(resultArea, txt);
	}

	function getSuffix() {
		return "_" + Date.now();
	}

	function createEventFrame() {
		var suf = getSuffix();

		var iframe = doc.createElement("iframe");
		iframe.setAttribute("id", eventPageId + suf);
		iframe.setAttribute("src", eventPageUrl);
		iframe.setAttribute("name", eventPageName + suf);
		iframe.setAttribute("width", eventPageWidth);
		iframe.setAttribute("height", eventPageHeight);
		return iframe;
	}
	
	function StorageIterator(storageName, storage){
		this.storageName = storageName;
		this.storage = storage;
		this.index = 0;
	}
	
	StorageIterator.prototype = {
		hasNext : function(){
			return this.index + 1 <= this.storage.length;
		},
		next : function(){
			var key = this.storage.key(this.index++);
			return {
				key : key,
				value : this.storage.getItem(key)
			};
		}
	};
	
	function getStorageInfo() {
		var info = [],
			storages = [
				new StorageIterator("sessionStorage", win.sessionStorage),
				new StorageIterator("localStorage", win.localStorage)
			];

		for (var i = 0; i < storages.length; i++) {
			var storageIter = storages[i];
			info.push("[" + storageIter.storageName + "]");
			while(storageIter.hasNext()){
				var keyValue = storageIter.next();
				info.push("\n");
				info.push(keyValue.key + ":" + keyValue.value);
			}
			info.push("\n");
		}

		return info.join("");
	}

	function addEvent() {
		m.addListener(m.ref("EventWindowOpener"), "click", function() {
			var feature = "width=" + eventPageWidth +
				",height=" + eventPageHeight +
				",status=yes,resizable=yes";
			window.open(eventPageUrl + "?" + getSuffix(), eventPageName + getSuffix(), feature);
		}, false);

		m.addListener(m.ref("EventFrameOpener"), "click", function() {
			var newFrame = createEventFrame();
			evtFrameContainer.appendChild(newFrame);
		}, false);

		m.addListener(resultClearer, "click", function() {
			m.print(resultArea, "", true);
		}, false);
		
		m.addListener(m.ref("diplay-all-keyvalue"), "click", function(){
			var info = getStorageInfo();
			m.println(resultArea, info, true);
		});

		/**
		 * ストレージを更新したウインドウやタブでstorageイベントは発生しない。
		 * また値が変化しないとstorageイベントは発生しない。
		 * 
		 * Storage.clearでイベントが発生した時はkey, oldValue, newValueはnullになる。
		 * 
		 * sessionStorageの場合はストレージの更新がフレームで行われた時しか発生しない。
		 * つまり別のタブやウインドウでストレージを更新してもlocalStorageでなければ
		 * storageイベントは発生しない。
		 * 
		 * sessionStorageに保存した値はブラウザを閉じると消える。
		 * localStorageに保存した値はブラウザを閉じても残り続ける。
		 * (Chromeのシークレットモードなどを利用している場合を除く。)
		 * 
		 * localStorageは複数のタブやウインドウで共有される。
		 * ただし各タブやウインドウの読み込んだページのオリジンが全て同じである
		 * 必要がある。
		 * 
		 * sessionStorageは同じウインドウ内の複数のフレーム間では共有される。
		 * フレームの読み込んだページのオリジンは全て同じである必要がある。
		 */
		m.addListener(win, "storage", function(evt) {
			var log = [
				"key:" + evt.key,
				"old value:" + evt.oldValue,
				"new value:" + evt.newValue,
				"url:" + evt.url
			];

			m.log(evt);

			outputLog(log.join("\n"));
		}, false);
	}

	function init() {
		addEvent();
	}

	init();

}(window, document, my));
