(function(win, doc, m) {
	"use strict";

	var coordinatesContainers = {
		"c0" : m.ref("CoordinatesParentContainer0"),
		"c0-0" : m.ref("CoordinatesChildContainer0"),
		"c0-1" : m.ref("CoordinatesChildContainer1")
	},
	coordinatesContainerTexts = {
		"c0" : m.ref("CoordinatesParentContainerText0"),
		"c0-0" : m.ref("CoordinatesChildContainerText0"),
		"c0-1" : m.ref("CoordinatesChildContainerText1")
	};

	function displayCoordinatesResults(coords) {
		m.ref("CoordinatesResultX").value = Math.round(coords.x);
		m.ref("CoordinatesResultY").value = Math.round(coords.y);
	}

	function getScrollOffsets(opt_win) {
		var w = opt_win || win;

		return {
			x : w.pageXOffset,
			y : w.pageYOffset
		};
	}

	function getContainerId() {
		var ContainerTypeEles = m.refs("ContainerType");

		for (var i = 0, len = ContainerTypeEles.length; i < len; i++) {
			var typeEle = ContainerTypeEles[i];
			if (typeEle.checked) {
				return typeEle.value;
			}
		}

		return null;
	}

	function getTargetContainer() {
		var containerId = getContainerId();
		return coordinatesContainers[containerId];
	}

	function getTargetContainerText() {
		var containerId = getContainerId();
		return coordinatesContainerTexts[containerId];
	}

	function isDocumentCoordinatesType(type) {
		return type === "document";
	}

	function getContainerCoordinates(box, coordinateType) {
		var coordinates = {};
		coordinates.x = box.left;
		coordinates.y = box.top;

		/**
		 * ビューポート座標にスクロールバーの座標を加算して
		 * ドキュメント座標に変換する。
		 */
		if (isDocumentCoordinatesType(coordinateType)) {
			var offsets = getScrollOffsets();
			coordinates.x += offsets.x;
			coordinates.y += offsets.y;
		}

		return coordinates;
	}

	function getCoordinatesType() {
		var coordinatesTypeEles = m.refs("CoordinatesType");
		for (var i = 0, len = coordinatesTypeEles.length; i < len; i++) {
			if (coordinatesTypeEles[i].checked) {
				return coordinatesTypeEles[i].value;
			}
		}

		return "";
	}

	function displayContainerCoordinates(evt) {
		/**
		 * getBoundingClientRectの戻り値のプロパティは
		 * 整数ではなく浮動小数点数になることもある。
		 */
		var container = getTargetContainer(),
			box = container.getBoundingClientRect(),
			type = getCoordinatesType();
		var coords = getContainerCoordinates(box, type);
		displayCoordinatesResults(coords);
	}

	/**
	 * インライン要素が現在何行で表示されているかを返す。
	 */
	function getVisibleLinage(inlineEle) {
		return inlineEle.getClientRects().length;
	}

	function displayContainerTextCoordinates(evt) {
		var text = getTargetContainerText(),
			/**
			 * インライン要素が2行に渡っていた場合，getClientRectsメソッドは
			 * 各行のDOMRectオブジェクトを配列に含めて返す。
			 */
			rects = text.getClientRects();

		m.log("座標取得対象のインライン要素は" + rects.length + "行で表示されています。");

		var box = rects[0],
			type = getCoordinatesType();
		var coords = getContainerCoordinates(box, type);
		displayCoordinatesResults(coords);
	}

	function SizeView(size) {
		this.width = size.width;
		this.height = size.height;
	}

	SizeView.prototype = {
		toString : function() {
			return "width=" + this.width + "px, height=" + this.height + "px";
		}
	};

	function getViewportSize(opt_win) {
		var _w = opt_win || win;

		var size = {
			width : _w.innerWidth,
			height : _w.innerHeight
		};

		return new SizeView(size);
	}

	function isIncludeBorderSize(id) {
		var chk = m.ref(id);
		return chk.checked;
	}

	function getBorderSize(ele) {
		/**
		 * @todo 
		 * border-top-widthをボーダーの代表値としている。 
		 */
		var borderSize = parseInt(getComputedStyle(ele).borderTopWidth);
		return borderSize;
	}

	function getElementSize(ele, opts) {
		var size = {};

		/* @todo こういう判定は好ましくない。別の引数を増やすべきか。 */

		var isBlockElement = !("multiLine" in opts);
		/* border-top-widthをボーダーの代表値としている。 */
		var borderSize = getBorderSize(ele);

		if (opts.border) {
			if (opts.invisibleArea) {
				/**
				 * コンテンツがコンテンツ領域からはみ出している時は
				 * scrollWidthまたはscrollHeightの方がoffsetWidthまたは
				 * offsetHeightよりも大きいはずである。
				 * scrollWidthまたはscrollHeightにはclientWidth, 
				 * clientHeight同様ボーダー・スクロールバーのサイズが含まれない。
				 * しかしこの時のボーダーやスクロールバーはコンテンツの内部に含まれて
				 * しまっているのでそれらのサイズが含まれないのは問題無い。
				 * 
				 * 一方コンテンツがコンテンツ領域からはみ出していない時は
				 * ボーダーやスクロールバーのサイズを含めるようにしなければ
				 * ならない。はみ出していない時はoffsetWidthまたは
				 * offsetHeightの方がscrollWidthまたはscrollHeightよりも
				 * 大きくなるはずである。
				 */
				size.width = Math.max(ele.offsetWidth, ele.scrollWidth);
				size.height = Math.max(ele.offsetHeight, ele.scrollHeight);
			} else {
				if (isBlockElement || opts.multiLine) {
					size.width = ele.offsetWidth;
					size.height = ele.offsetHeight;
				} else {
					size.width = ele.offsetWidth;
					size.height = ele.scrollHeight + (borderSize * 2);
				}
			}
		} else {
			if (opts.invisibleArea) {
				/**
				 * はみ出していなければclientWidth，scrollWidthは同じ値になる。
				 * clientHeightとscrollHeightについても同様。
				 */
				size.width = Math.max(ele.clientWidth, ele.scrollWidth);
				size.height = Math.max(ele.clientHeight, ele.scrollHeight);
			} else {
				if (isBlockElement) {
					size.width = ele.clientWidth;
					size.height = ele.clientHeight;
				} else {
					if (opts.multiLine) {
						/**
						 * 複数行の表示状態を反映した高さを得るにはoffsetHeightが
						 * 必要だが，これにはボーダーのサイズが含まれるのでそれを
						 * 引かなければならない。
						 * 1行目のtopと最終行のbottomと間の行のボーダーのサイズの合計を引く。
						 */
						size.width = ele.scrollWidth;
						size.height = ele.offsetHeight - ((borderSize * 2) + (borderSize * (opts.linage - 1)));
					} else {
						size.width = ele.scrollWidth;
						size.height = ele.scrollHeight;
					}
				}
			}
		}

		return new SizeView(size);
	}

	function displayViewportSize(evt) {
		var size = getViewportSize(),
			area = m.ref("ViewportSizeResultArea");

		m.println(area, size, true);
	}

	function displayContainerSize(evt) {
		var containerEle = getTargetContainer(),
			border = isIncludeBorderSize("IncludeBorderSize"),
			invisibleArea = m.ref("IncludeInvisibleArea").checked;

		var size = getElementSize(containerEle, {
			border : border,
			invisibleArea : invisibleArea
		}),
			area = m.ref("ContainerSizeResultArea");

		m.println(area, size, true);
	}

	function displayContainerTextSize(evt) {
		var textEle = getTargetContainerText(),
			border = isIncludeBorderSize("IncludeTextBorderSize"),
			multiLine = m.ref("IncludeMultiLineSize").checked;

		var size = getElementSize(textEle, {
			border : border,
			multiLine : multiLine,
			linage : getVisibleLinage(textEle)
		}),
			area = m.ref("ContainerTextSizeResultArea");

		m.println(area, size, true);
	}

	function updateCoordinates(evt) {
		var coodinatesType = getCoordinatesType(),
			coords = {};

		if (isDocumentCoordinatesType(coodinatesType)) {
			coords.x = evt.pageX;
			coords.y = evt.pageY;
		} else {
			coords.x = evt.clientX;
			coords.y = evt.clientY;
		}

		displayCoordinatesResults(coords);
	}

	function togglePointerCoordinates(evt) {
		/**
		 * updateCoordinatesをこの関数内に定義してしまうと
		 * WindowのremoveEventListenerを呼び出してもupdateCoordinatesの
		 * 呼び出しを停止できなくなる。
		 */
		
		/**
		 * PointerEventsには対応しない。
		 */
		var touches = evt.changedTouches || evt.touches,
			type = touches ? "touchmove" : "mousemove";
		
		if (evt.target.checked) {
			m.addListener(win, type, updateCoordinates, false);
		} else {
			m.removeListener(win, type, updateCoordinates, false);
		}
	}

	(function() {
		m.addListener(m.ref("ContainerCoordinatesGetter"), "click",
			displayContainerCoordinates, false);
		m.addListener(m.ref("ContainerTextCoordinatesGetter"), "click",
			displayContainerTextCoordinates, false);
		m.addListener(m.ref("ViewportSizeGetter"), "click",
			displayViewportSize, false);
		m.addListener(m.ref("ContainerSizeGetter"), "click",
			displayContainerSize, false);
		m.addListener(m.ref("ContainerTextSizeGetter"), "click",
			displayContainerTextSize, false);
		m.addListener(m.ref("EnablePointerCoordinates"), "click",
			togglePointerCoordinates, false);
	}());

}(window, document, my));
