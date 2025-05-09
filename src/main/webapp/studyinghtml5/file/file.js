(function(win, doc, m) {
	"use strict";

	var resultArea = m.ref("FileReadResult");

	function getFileMetaInfo(files, opt_separator) {
		var info = [],
			separator = opt_separator || "\n";

		if (files) {
			for (var i = 0; i < files.length; i++) {
				var file = files.item(i);
				info.push("ファイル名：" + file.name);
				info.push("ファイルサイズ：" + file.size + "バイト");
				info.push("ファイルMIMEタイプ：" + file.type);
				info.push("最終更新日時：" + file.lastModified);
				info.push(separator);
			}
		}

		return info.join(separator);
	}

	/**
	 * FileオブジェクトはBlobオブジェクトを特化させた
	 * オブジェクトなのでBlobオブジェクトとして扱える。
	 * Blob URLにはGETメソッドが使われる。
	 */
	function getBlobImage(blob, opt) {
		if (opt && opt.half) {
			blob = blob.slice(0, blob.size / 2, blob.type);
		}

		var img = new Image(),
			url = win.URL.createObjectURL(blob);

		img.onload = function() {
			/**
			 * revokeObjectURLされたURLをブラウザで参照すると
			 * 404エラーが返される。
			 */
			win.URL.revokeObjectURL(url);
		};
		img.src = url;

		return img;
	}

	function isImage(file) {
		return /^image\//.test(file.type);
	}

	function isText(file) {
		/**
		 * csvはtext/plainとして判別されずBlobオブジェクトのtypeプロパティは
		 * 空文字になっている。
		 * Firefox37, Chrome41, IE11において確認した。
		 * 
		 * BlobオブジェクトのtypeプロパティはBlobのMIMEタイプを
		 * 返し，MIMEタイプが得られない時は空文字を返すということらしいが，
		 * 実際はFileオブジェクトのnameプロパティの拡張子しか見ていないような
		 * 動きをしている。例えば画像ファイルの拡張子を削除すると
		 * そのBlobオブジェクトのtypeプロパティは空文字になる。
		 * reference:
		 * http://stackoverflow.com/questions/11182968/determining-unknown-content-types-with-the-html5-file-api
		 */
		if (file.type === "") {
			if(new RegExp(".csv", "i").test(file.name)){
				/* csvはテキストファイルだと見なす。 */
				return true;
			}else{
				/**
				 * csv以外でtypeプロパティが空文字なオブジェクトが
				 * 渡されたときはテキストファイルだと見なさない。
				 */
				return false;
			}
		} else {
			return /^text\//.test(file.type);
		}
	}

	/**
	 * イベントハンドラの引数からFileListオブジェクトは得られない。 
	 */
	function handleFileMetaInfo(evt) {
		/**
		 * イベントハンドラを登録した要素のfilesプロパティから
		 * 選択されたファイルに基づくFilesListオブジェクトを得る。
		 */
		var selectedFiles = this.files;
		var infoArea = doc.getElementById("FileMetaInfo");
		infoArea.value = "";
		var info = getFileMetaInfo(selectedFiles);
		infoArea.value += info;
	}

	function handleImageFile(evt) {
		var selectedFiles = this.files;

		var imgContainer = doc.getElementById("FileBlobContainer"),
			imgKeyword = "FileImage",
			imgClassName = imgKeyword;

		var oldImgs = doc.querySelectorAll("." + imgClassName);

		Array.prototype.forEach.call(oldImgs, function(img, idx, imgs) {
			imgContainer.removeChild(img);
		});

		var half = doc.getElementById("FileHalfCheck").checked;

		for (var i = 0, max = selectedFiles.length; i < max; i++) {
			var file = selectedFiles.item(i);

			if (isImage(file)) {
				var img = getBlobImage(file, {
					half : half
				});
				img.setAttribute("class", imgClassName);
				imgContainer.appendChild(img);
			} else {
				m.log("画像ファイルではありません。 ... " + file.name);
			}
		}
	}

	function getCharacterEncoding() {
		var encElles = m.refs("FileCharacterEncoding"),
			selectedEle = m.selected(encElles);

		return selectedEle.value;
	}

	/**
	 * 1つのファイル読み込み毎にFileReaderオブジェクトを
	 * 生成する必要がある。
	 */
	function readFile(files, funcName, opt) {
		opt = opt || {};
		opt.predicate = opt.predicate || m.alwaysTrue;

		for (var i = 0, max = files.length; i < max; i++) {
			var file = files.item(i);

			if (opt.predicate(file)) {
				var reader = new FileReader();
				reader.onload = opt.onload || m.noop;
				reader.onerror = opt.onerror || m.noop;

				var readFunc = reader[funcName],
					args = [file].concat(opt.args);
				readFunc.apply(reader, args);
			} else {
				m.println(resultArea, file.name + "の読み込み条件を満たしませんでした。", true);
			}
		}
	}

	function getBlobURLFromArrayBuffer(arrayBuffer, type) {
		/**
		 * BlobBuilderはFirefox37，Chrome41では既に存在しない。
		 * reference:
		 * http://updates.html5rocks.com/2012/06/Don-t-Build-Blobs-Construct-Them
		 */
		var blob;
		if (win.MSBlobBuilder) {
			var bb = new MSBlobBuilder();
			bb.append(arrayBuffer);
			blob = bb.getBlob(type);
		} else {
			blob = new Blob([arrayBuffer], {
				type : type
			});
		}

		setTimeout(function() {
			win.URL.revokeObjectURL(blob);
		}, 5000);

		/**
		 * Blob URLはどのようなMIMEタイプのファイルに対しても
		 * 生成することができる。画像に限定されない。
		 */
		return win.URL.createObjectURL(blob);
	}

	var readAs = {
		dataURL : function(files) {
			/**
			 * 画像以外もData URLとして読み込むことができる。
			 */
			readFile(files, "readAsDataURL", {
				onload : function(evt) {
					displayReadResult(evt.target.result);
				}
			});
		},
		text : function(files) {
			/**
			 * readAsTextは文字エンコーディングを指定しないと
			 * UTF-8として解釈する。
			 */
			readFile(files, "readAsText", {
				predicate : isText,
				onload : function(evt) {
					displayReadResult(evt.target.result);
				},
				args : [getCharacterEncoding()]
			});
		},
		arrayBuffer : function(files) {
			readFile(files, "readAsArrayBuffer", {
				onload : function(buffer) {
					var type = files[0].type || "text/plain";
					var url = getBlobURLFromArrayBuffer(buffer, type);
					displayReadResult(url);
				}
			});
		}
	};

	function displayReadResult(result) {
		m.println(resultArea, result + "\n<END>\n", true);
	}

	function handleReadFile(files, funcName) {
		resultArea.value = "";
		readAs[funcName](files);
	}

	function addEventListener() {
		var fileInput = doc.getElementById("FileMetaTarget");
		fileInput.addEventListener("change", handleFileMetaInfo, false);

		var blobInput = doc.getElementById("FileBlobTarget");
		blobInput.addEventListener("change", handleImageFile, false);

		var dataURLInput = doc.getElementById("FileDataURLTarget");
		dataURLInput.addEventListener("change", function(evt) {
			handleReadFile(this.files, "dataURL");
		}, false);

		var textInput = doc.getElementById("FileTextTarget");
		textInput.addEventListener("change", function(evt) {
			handleReadFile(this.files, "text");
		}, false);

		var arrayBufferInput = doc.getElementById("FileArrayBufferTarget");
		arrayBufferInput.addEventListener("change", function(evt) {
			handleReadFile(this.files, "arrayBuffer");
		}, false);
	}

	function init() {
		addEventListener();
	}

	init();

}(window, document, my));