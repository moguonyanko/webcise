(function (win, doc, m) {
	"use strict";

	/**
	 * 型付け配列のコンストラクタ関数を分かりやすい名前に置き換える。
	 */
	var Byte = Int8Array,
		UnsignedByte = Uint8Array,
		UnsignedByteClamped = Uint8ClampedArray,
		Short = Int16Array,
		UnsiginedShort = Uint16Array,
		Int = Int32Array,
		UnsiginedInt = Uint32Array,
		Float = Float32Array,
		Double = Float64Array;

	var resultArea = m.ref("typed-array-result-area"),
		imageInput = m.ref("image-file-input");

	function readWithType(view, byteOffset, bytesPerElement, opt_littleEndian) {
		var littleEndian = opt_littleEndian !== undefined ?
			opt_littleEndian :
			/**
			 * デフォルトはビッグエンディアンバイトオーダーでバッファを読むを読むよう
			 * ビューに指示する。
			 */
			false;

		/**
		 * @todo
		 * getUintで始まるメソッド呼び出しに固定してしまっている。
		 * 
		 * DataViewのメソッド名にはビット数が付いている。 
		 * 引数のバイト数をビットに変換してメソッド名の一部とする。
		 */
		return view["getUint" + (bytesPerElement * 8)](byteOffset, littleEndian);
	}

	function ImageMetaInfo(info) {
		this.width = info.width;
		this.height = info.height;
		this.colorDepth = info.colorDepth;

		m.freeze(this);
	}

	ImageMetaInfo.prototype = {
		toString: function () {
			return "width(px):" + this.width + ",height(px):" + this.height +
				",colorDepth:" + this.colorDepth;
		}
	};

	function getImageInfo(buffer) {
		/**
		 * エンディアンを意識したいときはDataViewを使う。
		 * DataViewは型を知らないのでメソッド名を通じて
		 * 型を指定してやらないと行けない。
		 */
		var view = new DataView(buffer);

		var width = readWithType(view, 16, Int.BYTES_PER_ELEMENT),
			height = readWithType(view, 20, Int.BYTES_PER_ELEMENT),
			colorDepth = readWithType(view, 24, Byte.BYTES_PER_ELEMENT);

		return new ImageMetaInfo({
			width: width,
			height: height,
			colorDepth: colorDepth
		});
	}

	(function () {
		m.addListener(imageInput, "change", function () {
			var file = this.files[0],
				reader = new FileReader();

			reader.onload = function (evt) {
				var buffer = evt.target.result;
				
				m.log(buffer);
				
				/**
				 * TypedArrayはDataViewの引数に指定できない。
				 * TypeErrorが発生する。
				 */
				//var a = new Uint8ClampedArray(buffer);
				//var v = new DataView(a);
				//m.log(v);
				
				m.println(resultArea, "画像のサイズ(バイト):" + buffer.byteLength);
				var info = getImageInfo(buffer);
				m.println(resultArea, info);
			};
			reader.readAsArrayBuffer(file);
		}, false);

		m.addListener(m.ref("clear-typed-array-element"), "click", function () {
			m.print(resultArea, "", true);
		}, false);
	}());

}(window, document, my));
