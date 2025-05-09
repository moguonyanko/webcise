(function(win, doc, m) {
	"use strict";

	var idb = win.indexedDB;

	var dbName = "members",
		indexSuffix = "Index";

	/**
	 * バージョン番号は1以上でなければエラーになる。
	 */
	var version = 5;

	/**
	 * nameはユニークとする。
	 */
	var sampleRecords = [
		{
			name : "foo",
			age : 20,
			image : null
		},
		{
			name : "baz",
			age : 33,
			image : null
		},
		{
			name : "cocoa",
			age : 15,
			image : null
		},
		{
			name : "sakura",
			age : 12,
			image : null
		},
		{
			name : "jiro",
			age : 45,
			image : null
		},
		{
			name : "hoge",
			age : 13,
			image : null
		},
		{
			name : "taro",
			age : 50,
			image : null
		},
		{
			name : "neko",
			age : 10,
			image : null
		},
		{
			name : "mike",
			age : 30,
			image : null
		},
		{
			name : "bar",
			age : 21,
			image : null
		}
	];

	var resultArea = el("InfoArea"),
		recordName = el("record-name"),
		recordAge = el("record-age"),
		recordImage = el("record-image"),
		autoCreateId = el("auto-create-id"),
		uniqueName = el("unique-name"),
		imageView = el("record-image-view"),
		searchConditionName = el("search-condition-name"),
		searchConditionAge = el("search-condition-age"),
		enableCond = el("enable-search-condition"),
		searchConditionTypes = m.refs("search-condition-type");

	var selectedFile,
		resultImageName = "result-record-image";

	function el(id) {
		return m.ref(id);
	}

	function log(txt) {
		m.println(resultArea, txt);
		m.log(txt);
	}

	function createRecord() {
		var record = {
			name : recordName.value,
			age : parseInt(recordAge.value),
			image : selectedFile || null
		};

		return record;
	}

	function isAutoCreateId() {
		return autoCreateId.checked;
	}

	function initStoreIndexes(store, indexName, columnName, opts) {
		opts = opts || {};

		var indexParams = {
			unique : opts.unique
		};

		store.createIndex(indexName, columnName, indexParams);
	}

	function initObjectStore(evt) {
		var db = evt.target.result,
			storeParams = {};

		if (isAutoCreateId()) {
			storeParams = {
				keyPath : "id",
				autoIncrement : true
			};
		} else {
			storeParams = {
				keyPath : "name",
				autoIncrement : false
			};
		}

		var store = db.createObjectStore(dbName, storeParams);

		/**
		 * indexとして設定したカラム名がIDBObjectStore.indexの引数で指定できる。
		 */
		initStoreIndexes(store, "name" + indexSuffix, "name", {
			unique : uniqueName.checked
		});
		initStoreIndexes(store, "age" +  + indexSuffix, "age");
	}

	function closeDB() {
		requestDB(function(db) {
			/**
			 * closeは同期メソッド。
			 */
			db.close();
			log("CLOSE DATABASE");
		});
	}

	function deleteDB() {
		/**
		 * IndexedDBがcloseされるまではdeleteは実行待ち状態になる。
		 */
		var deleteRequest = idb.deleteDatabase(dbName);
		deleteRequest.onerror = log;
		deleteRequest.onsuccess = log;
	}

	function addRecord(records) {
		requestDB(function(db) {
			/* DBがCLOSEだとトランザクション開始不可能 */
			var transaction = db.transaction(dbName, "readwrite");
			var store = transaction.objectStore(dbName);

			/**
			 * putと異なり上書きせず追加する。 
			 * Keyが衝突するとエラーになる。
			 */
			for (var recIdx = 0; recIdx < records.length; recIdx++) {
				var addReq = store.add(records[recIdx]);
				addReq.onsuccess = log;
				addReq.onerror = log;
			}
		});
	}

	function enableSearchCondition() {
		return enableCond.checked;
	}

	function getConditionIndexName() {
		return m.selected(searchConditionTypes);
	}

	var indexRangeFactory = {
		name : function(condition) {
			/**
			 * IDBStore.getの引数に条件値を渡してレコード取得するのと変わらない？
			 */
			return IDBKeyRange.only(condition);
		},
		age : function(condition) {
			/* 下限値のレコードを含める。 */
			var lowerOpen = true;
			return IDBKeyRange.lowerBound(condition, lowerOpen);
		}
	};

	function searchRecord(args) {
		requestDB(function(db) {
			var transaction = db.transaction(dbName, "readonly"),
				store = transaction.objectStore(dbName),
				cursorRequest;

			if (args.condition) {
				var index,
					range,
					selectedIndexName = getConditionIndexName();

				/**
				 * @todo
				 * 複数のIDBKeyRangeを指定してopenCursorしたい。
				 */
				for (var indexName in args.condition) {
					var conditionValue = args.condition[indexName];
					if (conditionValue !== undefined &&
						selectedIndexName === indexName &&
						selectedIndexName in indexRangeFactory) {
						range = indexRangeFactory[selectedIndexName](conditionValue);
						index = store.index(selectedIndexName + indexSuffix);
						break;
					}
				}

				if (index) {
					cursorRequest = index.openCursor(range);
				} else {
					throw new Error("Not found condition index:" + index);
				}
			} else {
				cursorRequest = store.openCursor();
			}

			cursorRequest.onsuccess = function(evt) {
				var cursor = evt.target.result;
				if (cursor) {
					var resultValue = cursor.value;
					args.onsuccess(resultValue);
					cursor.continue();
				}
			};

			cursorRequest.onerror = log;
		});
	}

	function requestDB(requestFunc) {
		requestFunc = requestFunc || m.noop;

		/**
		 * 既にopenしている時に何度openを呼び出しても問題無い。
		 */
		var openRequest = idb.open(dbName, version);
		openRequest.onerror = log;
		/**
		 * 同じ名前で同じバージョンのIndexedDBが既に存在すれば
		 * onupgradeneededプロパティに設定されたハンドラは呼び出されない。
		 */
		openRequest.onupgradeneeded = initObjectStore;

		openRequest.onsuccess = function(evt) {
			var db = evt.target.result;
			requestFunc(db);
		};
	}

	function initDB() {
		/**
		 * サンプルレコード追加時に必要に応じオブジェクトストアが
		 * 作成される。
		 */
		addRecord(sampleRecords);
	}

	function addClickListener(id, fn) {
		m.addListener(el(id), "click", fn, false);
	}

	function createCondition() {
		var cond = null;
		if (enableSearchCondition()) {
			cond = {
				name : searchConditionName.value,
				age : parseInt(searchConditionAge.value)
			};
		}
		return cond;
	}

	function displaySearchRecords() {
		searchRecord({
			condition : createCondition(),
			onsuccess : function(resultValue) {
				var record = [];
				for (var name in resultValue) {
					var value = resultValue[name];
					if (name !== "image") {
						record.push(name + ":" + value + " ");
					} else {
						outputImage(value);
					}
				}
				log(record.join(""));
			}
		});
	}

	function clearImage() {
		var targetResultImages = m.refs(resultImageName);

		if (targetResultImages.length > 0) {
			Array.prototype.forEach.call(targetResultImages, function(el) {
				if (el.name === resultImageName) {
					el.parentNode.removeChild(el);
				}
			});
		}
	}

	function outputImage(imageFile) {
		clearImage();

		if (imageFile) {
			var img = new Image(),
				url = win.URL.createObjectURL(imageFile);

			img.onload = function() {
				imageView.appendChild(img);
				win.URL.revokeObjectURL(url);
			};
			img.name = resultImageName;
			img.src = url;
		}
	}

	function clearAllResult() {
		clearImage();
		m.print(resultArea, "", true);
	}
	
	function clearAllRecords(){
		requestDB(function(db){
			var transaction = db.transaction(dbName, "readwrite");
			var store = transaction.objectStore(dbName);
			var clearRequest = store.clear();
			clearRequest.onsuccess = log;
			clearRequest.onerror = log;
		});
	}

	(function() {
		m.addListener(win, "DOMContentLoaded", initDB, false);
		addClickListener("AddRecord", function() {
			var rec = createRecord();
			addRecord([rec]);
		});
		addClickListener("DeleteDB", deleteDB);
		addClickListener("CloseDB", closeDB);
		addClickListener("display-records", displaySearchRecords);
		addClickListener("result-clearer", clearAllResult);
		m.addListener(recordImage, "change", function() {
			var files = this.files;
			selectedFile = files[0];
		});
		m.addListener(enableCond, "click", function(evt) {
			var condContainer = el("search-condition-container");
			if (!enableSearchCondition()) {
				condContainer.classList.add("disable-element");
			} else {
				condContainer.classList.remove("disable-element");
			}
		}, false);
		addClickListener("clear-all-records", clearAllRecords);
	}());

}(window, document, my));
