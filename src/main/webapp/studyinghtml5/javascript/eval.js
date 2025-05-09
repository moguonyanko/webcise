(function nostrict(win, doc) {
	var globalEval = eval;

	function initGlobalValue() {
		/* strictモードでは以下の行はエラーになる。 */
		x = "x not changed";
		y = "y not changed";
	}

	function direct() {
		var x = "local x not changed";
		eval("x = \"<strong>x changed!</strong>\";");
		return x;
	}

	function indirect() {
		var y = "local y not changed";
		/* グローバル変数を変更してしまうeval */
		globalEval("y = \"<strong>y changed!</strong>\";");
		/* 戻り値はローカル変数の値になる。 */
		return y;
	}

	function display(id, fn) {
		var res = fn();

		var results = [
			res,
			/* グローバル変数が変更されているかを確認する。 */
			"global x=" + x + ", global y=" + y + ""
		];

		var info = results.join(":");

		my.log(info);
		my.println(my.ref(id), info, true);
		initGlobalValue();
	}

	function isStrict() {
		return this === undefined;
	}

	function init() {
		var info = my.ref("NowModeInfo");

		if (isStrict()) {
			my.println(info, "strictモードで実行中");
		} else {
			my.println(info, "非strictモードで実行中");
		}

		initGlobalValue();
	}

	init();

	win.evalNS = {
		direct : function() {
			display("DirectEvalResultArea", direct);
		},
		indirect : function() {
			display("IndirectEvalResultArea", indirect);
		}
	};

}(window, document));