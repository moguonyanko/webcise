(function(win, m) {
	"use strict";
	
	var JSON_INDENT = 4;

	function createWeightFilter(border, modifier) {

		/**
		 * 各階層のプロパティが解釈されるときに毎回呼び出される。
		 * thisは現在のプロパティ値がオブジェクトであればそのオブジェクトになり，
		 * 基本データ型であればparse中の階層のオブジェクトになる。
		 * プロパティが存在しないオブジェクトはparseされるがthisになることはない。
		 */
		return function(name, value) {
			if (name === "weight" && value >= border) {
				this.name = modifier(this, name, value);
			}else if(name === "weight" && value < border){
				/**
				 * weightプロパティをparse結果から削除する。 
				 */
				return undefined;
			}

			return value;
		};
	}
	
	function weightModifier(obj, name, value) {
		return "<strong>" + obj.name + " is too weight!</strong>";
	}

	function defaultFilter(name, value) {
		return value;
	}
	
	function defaultModifier(obj, name, value){
		return value;
	}

	var modifiers = {
		weight : {
			modifier : weightModifier
		}
	};

	var filterFactories = {
		weight : {
			factory : createWeightFilter
		}
	};

	function getFilter(key, border) {
		if (key in filterFactories) {
			var factory = filterFactories[key].factory,
				modifier = defaultModifier;
			
			if(key in modifiers){
				modifier = modifiers[key].modifier;
			}
			
			return factory(border, modifier);
		} else {
			return defaultFilter;
		}
	}
	
	function getSampleSourceJSON(){
		var container = m.ref("SampleJSONObject"),
			/**
			 * pre要素内の文字列はtextContentプロパティか
			 * TextNodeのnodeValueとして保存されている。
			 */
			jsonText = container.textContent;
			//jsonText = container.firstChild.nodeValue;
			
		return jsonText;
	}

	/**
	 * DOMは最初の関数，最初のレイヤのみで触るように心がける。
	 */
	function parseSampleJSON() {
		var eles = m.refs("JSONFilters"),
			borderEle = m.ref("JSONBorderValue");

		var ele;
		for (var i = 0, len = eles.length; i < len; i++) {
			if (eles[i].checked) {
				ele = eles[i];
				break;
			}
		}
		
		var filter = getFilter(ele.value, borderEle.value);

		return JSON.parse(getSampleSourceJSON(), filter);
	}

	function output(o) {
		var area = m.ref("JSONResultArea");
		m.println(area, o, true);
	}
	
	function stringifySampleJSON(json){
		var isSqeeze = m.ref("JSONPropertySqeezeCheck").checked;
		
		var targetProperties = null;
		if(isSqeeze){
			/**
			 * 配列を渡して意図したフィルタリングを行うのは
			 * 階層が1つしかないJSONでなければ難しい。
			 * トップレベルに配列で指定したプロパティが存在しなければ
			 * 空のJSONの文字列が返されてしまう。
			 * 関数を渡してフィルタリングする方が望ましい。
			 */
			targetProperties = ["name", "age"];
		}
		
		var strJson = JSON.stringify(json, targetProperties, JSON_INDENT);
		
		return strJson;
	}

	(function init() {
		m.addListener(m.ref("DisplayParsedJSON"), "click", function() {
			var json = parseSampleJSON();
			m.log(json);
			var strJson = JSON.stringify(json, null, JSON_INDENT);
			output(strJson);
		});
		
		m.addListener(m.ref("DisplayStringifiedJSON"), "click", function(){
			var json = parseSampleJSON();
			var strJson = stringifySampleJSON(json);
			m.log(strJson);
			output(strJson);
		});

		m.export("jsonNS", {});
	}());

}(window, my));