(function(win, doc) {
	"use strict";

	var area = doc.getElementById("ResultInnerFrameArea");

	var sample = [1, 2, 3, 4, 5],
		sampleConstructor = Array;

	var subWin0;

	function println(txt) {
		my.log(frames);
		area.value += txt + "\n";
	}

	function dumpFrames() {
		var frames = win.frames;

		Array.prototype.forEach.call(frames, function(frm, i) {
			/**
			 * 後ろの===は先に書かれた+に優先度で負けるので，
			 * 意図した結果を得るには()で囲む必要がある。 
			 */
			println("frames[" + frm.name + "] === frames[" + i + "] ... " + (frm === frames[i]));

			/* src属性を使ってquerySelectorするのは許されない？エラーになる。 */
			//var frmEle = doc.querySelector(".InnerFrameContainer iframe[src=" + frm.name + ".html]");
			var frmEle = doc.getElementById("SubInnerFrame" + i);
			println("iframe.contentWindow === iframe ... " + (frmEle.contentWindow === frm));
		});
	}

	function openWindows() {
		var style = "width=400,height=300,status=yes,resizable=yes",
			replaceHistory = true;

		/**
		 * 同一ページを読み込んだiframeがDOMツリー上に存在する時は
		 * そのページをwindow.openで開くことができない。
		 * openの戻り値(Windowオブジェクト)は得られる。
		 */
		var w0 = win.open("sub0.html", "sub0", style, replaceHistory);
		var w1 = win.open("sub1.html", "sub1", style, replaceHistory);

		println("w0.opener === window ... " + (w0.opener === win));
		println("w1.opener === window ... " + (w1.opener === win));
	}

	function checkInstance() {
		return sample instanceof sampleConstructor;
	}

	function checkInstanceOf(obj) {
		return obj instanceof sampleConstructor;
	}

	/**
	 * フレームをまたいだ状態でオブジェクトの型を調べる。
	 * instanceof の挙動を調べる。
	 */
	function checkInstanceViaFrames() {
		var frames = win.frames;

		var frm0 = frames.sub0,
			frm1 = frames.sub1;

		my.println(area, checkInstance());
		my.println(area, frm0.sub0NS.checkInstance());
		my.println(area, frm1.sub1NS.checkInstance());

		/**
		 * 別のフレームのオブジェクトをinstanceofで型チェックしても
		 * 予想した結果は得られない。Arrayのような組み込みオブジェクト
		 * であってもフレームが異なれば異なるインスタンスとして
		 * 扱われてしまう。
		 */
		my.println(area, checkInstanceOf(frm0.sub0NS.getArray()));
		my.println(area, checkInstanceOf(frm1.sub1NS.getArray()));
	}

	function init() {
		//subWin0 = win.open("sub0.html");
	}

	win.frameNS = {
		dumpFrames : dumpFrames,
		openWindows : openWindows,
		checkInstanceViaFrames : checkInstanceViaFrames,
		displaySubContainer : function() {
			var container = win.frames.sub0.sub0NS.getContainer();
			if (container) {
				my.println(area, container.getAttribute("id"));
			}
		}
	};

	init();

}(window, document));