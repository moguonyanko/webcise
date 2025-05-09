(function(win, doc, m) {
	"use strict";

	var dragContainer = m.ref("draggable-container"),
		dropContainer = m.ref("drop-target-container");

	var dragSampleImage = new Image();
	dragSampleImage.src = "../../favicon.ico";

	/**
	 * reference:
	 * https://developer.mozilla.org/ja/docs/DragDrop/Drag_Operations
	 */
	var dragSampleCanvas = (function() {
		var dragCanvas = doc.createElement("canvas");
		dragCanvas.width = 50;
		dragCanvas.height = 50;

		var imgContext = dragCanvas.getContext("2d");
		imgContext.lineWidth = 4;
		imgContext.moveTo(0, 0);
		imgContext.lineTo(50, 50);
		imgContext.moveTo(0, 50);
		imgContext.lineTo(50, 0);
		imgContext.stroke();

		/**
		 * DataTransfer.setDragImageはImageDataを受け取るとエラーを返す。
		 */
		//return imgContext.getImageData(0, 0, dragCanvas.width, dragCanvas.height);
		return dragCanvas;
	}());

	var dragImages = {
		image : dragSampleImage,
		canvas : dragSampleCanvas
	};

	function getSelectedDragImageType() {
		var types = m.refs("drag-image-type");

		for (var i = 0, len = types.length; i < len; i++) {
			if (types[i].checked) {
				return types[i].value;
			}
		}

		/**
		 * デフォルトはブラウザサポート状況の良い
		 * Imageオブジェクトを選択したことにする。 
		 */
		return "image";
	}

	function getDragImage() {
		var dragImageType = getSelectedDragImageType();
		return dragImages[dragImageType];
	}

    /**
     * ドラッグ操作位置にアイコンとして表示する画像を設定する。
     */
	function setDragWithCustomImage(dataTransfer) {
		var dragImage = getDragImage(),
			xOffset = 25,
			yOffset = 25;

		/**
		 * Firefox37ではDataTransfer.setDragImageの第1引数にはImage以外に
		 * Canvasも指定することができる。
		 * Chrome41の場合，Canvasを渡した時は無視される。
		 * Firefox37でもChrome41でもsetDragImageにImageDataを渡すとエラーになる。
		 * 
		 * 複数の画像をドラッグ画像として同時に表示することはできない。
		 * 後からsetDragImageされた画像が用いられる。
		 */
		dataTransfer.setDragImage(dragImage, xOffset, yOffset);
	}

	function dragStart(evt) {
		var dt = evt.dataTransfer;
        
        const target = evt.target,
            draggableElementId = target.id,
			/**
			 * URLとして不適切な値をsetDataした場合，
			 * Chrome41では「text/uri-list」がDtataTransfer.typesに
			 * 含まれなくなる。Firefox37では含まれる。
             * プロトコルを省いたURLは不適切と見なされる。
			 */
			sampleUrl = win.location.href;

		dt.setData("text/plain", draggableElementId);
		dt.setData("text/uri-list", sampleUrl);
		dt.setData("text/html", target.outerHTML);

		setDragWithCustomImage(dt);

		m.log("DataTransfer.dropEffect ... " + dt.dropEffect);
		/**
		 * effectAllowedを指定しなくてもドラッグアンドドロップできる。
		 * noneを設定するとドラッグアンドドロップできなくなる。
		 */
		dt.effectAllowed = "copyMove";
	}

	function preventDefault(evt) {
		evt.preventDefault();
	}

	function dragEnd(evt) {
		var dt = evt.dataTransfer;
		if (dt.dropEffect === "move") {
			/**
			 * Chrome41ではdragendではDataTransfer.typesは空の配列になっている。
			 * Firefox37ではdropイベント時と同じ値が保存されている。
			 */
			var draggableDataType = getDataTypeString(dt);
			var target = evt.target,
				info = "<p>ドラッグされました。</p>" +
				"<p>dragendイベント内で取得可能なドラッグ型は「" + draggableDataType + "」です。</p>";

			m.print(target, info, true);
		}
	}

	function getDataTypeString(dt) {
		var separator = ",";

		/**
		 * DataTransfer.typesはChrome41では配列だが
		 * Firefox37ではDOMStringListである。
		 */
		if (Array.isArray(dt.types)) {
			return dt.types.join(separator);
		} else {
			return Array.from(dt.types).reduce(function(t1, t2) {
				if (t1 && t2) {
					return t1 + separator + t2;
				} else {
					return t2;
				}
			}, "");
		}
	}

	function containType(dt, type) {
		if (typeof dt.types.contains === "function") {
			return dt.types.contains(type);
		} else {
			return dt.types.indexOf(type) >= 0;
		}
	}
    
    const getSelectedDropType = () => {
        const typeEles = doc.querySelectorAll(".drop-type");
        const selectedTypeEles = Array.from(typeEles).filter(ele => ele.checked);
        return (selectedTypeEles[0] || {}).value;
    };
    
    const dropAction = {
        /**
         * ドロップされる要素がtext/plainの場合，DataTransfer.effectAllowedが
         * copyMoveであっても元の要素から自動的に削除される。
         */
        "text/plain": ({dataTransfer, dropTarget}) => {
            const id = dataTransfer.getData("text/plain");
            const ele = doc.getElementById(id);
    		if (ele) {
                dropTarget.appendChild(ele);
            } else {
                throw new Error(`ID="${id}"の要素は存在しません。`);
            }
        },
        /**
         * ドロップされる要素がtext/htmlの場合，ドラッグ開始位置にある元の要素は
         * 自動的には削除されない。
         */
        "text/html": ({dataTransfer, dropTarget}) => {
            const ele = dataTransfer.getData("text/html");
    		dropTarget.innerHTML += ele;
        }
    };

	function drop(evt) {
		preventDefault(evt);
		const dt = evt.dataTransfer;
		const dragTypeNames = getDataTypeString(dt);
        const dropType = getSelectedDropType();
        if (dropType in dropAction) {
            try {
                dropAction[dropType]({dataTransfer: dt, dropTarget: evt.target});
                const info = `ドロップ成功:
                        ${evt.type}イベント内で取得可能なドラッグ型は<strong>${dragTypeNames}</strong>です。`;
                evt.target.innerHTML += info;
            } catch(err) {
                evt.target.innerHTML += `ドロップ失敗:${err.message}`;
            }
        } else {
            console.warn(`${dropType}には未対応です。`);
        }
	}
    
    const eventOptions = {
        capture: false,
        passive: false
    };

	const addListeners = () => {
        // TODO: iOS Safariでdragができない。
        // モバイル端末でdragするためのイベントリスナ設定
		dragContainer.addEventListener("touchmove", preventDefault, eventOptions);

        // dragイベントリスナ設定
		dragContainer.addEventListener("dragstart", dragStart, eventOptions);
		dragContainer.addEventListener("dragover", preventDefault, eventOptions);
		dragContainer.addEventListener("drop", preventDefault, eventOptions);
		dragContainer.addEventListener("dragend", dragEnd, eventOptions);
        
        // dropイベントリスナ設定
		dropContainer.addEventListener("drop", drop, eventOptions);
		dropContainer.addEventListener("dragover", preventDefault, eventOptions);
		dropContainer.addEventListener("dragenter", preventDefault, eventOptions);
	};
    
    const init = () => {
        addListeners();
    };
    
    win.addEventListener("DOMContentLoaded", init);
}(window, document, window.goma));
