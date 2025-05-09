(function(win, doc, m) {
	"use strict";

	var area = m.ref("SampleNodeInfomationArea"),
		sampleRoot = m.ref("SampleElementNodeContainer");

	var NODETYPECONST = {
		1 : "ELEMENT_NODE",
		3 : "TEXT_NODE",
		7 : "PROCESSING_INSTRUCTION_NODE",
		8 : "COMMENT_NODE",
		9 : "DOCUMENT_NODE",
		10 : "DOCUMENT_TYPE_NODE",
		11 : "DOCUMENT_FRAGMENT_NODE"
	};

	function pp(txt) {
		m.log(txt);
		m.println(area, txt);
	}

	function outputNodeInfomation(node) {
		if (!node) {
			return;
		}

		pp("**********************************");
		pp("id:" + node.id);
		pp("nodeName:" + node.nodeName);
		pp("nodeType:" + node.nodeType + ", This is " + NODETYPECONST[node.nodeType]);
		pp("nodeValue:" + node.nodeValue);
		pp("data:" + node.data);
		/**
		 * 親ノードがElementまたはDocumentの場合，その子ノードの
		 * 全てのtextContentを返してくる。特定の要素のtextContentのみを
		 * 取得したいならばfirstChild.nodeValueから得るほうが安全か。
		 * ただし外部のライブラリにfirstChildを変更されていないことが前提である。
		 */
		pp("textContent:" + node.textContent);
		/* textから値が得られる時は同じ値がtextContentからも得られる。 */
		pp("text:" + node.text);
		/**
		 * ownerDocumentにはDocumentFragmentやドキュメント追加前のノードでも
		 * HTMLDocumentが保持されている。nullになるのはdocument.ownerDocument
		 * だけかもしれない。
		 */
		pp("ownerDocument:" + node.ownerDocument);

		if (node.hasChildNodes()) {
			for (var i = 0, len = node.childNodes.length; i < len; i++) {
				outputNodeInfomation(node.childNodes[i]);
			}
		}
	}

	function outputNodeContainerInfomation() {
		var sampleFragment = doc.createDocumentFragment();

		var sampleScript = doc.createElement("script");
		sampleScript.setAttribute("id", "SampleScriptNode");
		sampleScript.setAttribute("src", "dummy.js");
		outputNodeInfomation(sampleScript);

		/**
		 * DocumentFragmentにappendChildしてもDocumentFragmentの
		 * textContentやnodeValueに何か設定されるわけではない。
		 */
		sampleFragment.appendChild(sampleScript);
		outputNodeInfomation(sampleFragment);

		sampleRoot.appendChild(sampleFragment);
		outputNodeInfomation(sampleRoot);
		sampleRoot.removeChild(sampleScript);
	}

	function outputNodeEquality(node, otherNode) {
		if (node && otherNode) {
			var separator = " ... ";
			
			/**
			 * 属性や子ノードが等しければ比較対象のノードがcloneNodeの
			 * 戻り値だったとしてもNode::isEqualNodeはtrueを返す。
			 * 即ち等しさの基準がisSameNodeや==演算子より緩い。
			 */
			pp(node.id + ":" + node.nodeName + " isEqualNode " +
				otherNode.id + ":" + otherNode.nodeName + separator +
				node.isEqualNode(otherNode));
			/** 
			 * Node::isSameNodeは本当に同じノードとの比較でない限り
			 * trueを返さない。比較対象がcloneNodeの戻り値でもfalseとなる。
			 * ==演算子で比較した時も同じ結果になる。
			 * なおDOM level 4でNode::isSameNodeは削除されている。 
			 * ただしIE11には実装されている。
			 */
			if(typeof node.isSameNode === "function"){
				pp(node.id + ":" + node.nodeName + " isSameNode " +
					otherNode.id + ":" + otherNode.nodeName + separator +
					node.isSameNode(otherNode));
			}
			/**
			 * ==演算子と===演算子の結果は常に等しくなる。
			 * (暗黙の型変換が発生しないため？)
			 */
			pp(node.id + ":" + node.nodeName + " == " +
				otherNode.id + ":" + otherNode.nodeName + separator +
				(node == otherNode));
			pp(node.id + ":" + node.nodeName + " === " +
				otherNode.id + ":" + otherNode.nodeName + separator +
				(node === otherNode));
		}
	}

	function outputNodeContainerEquality(root) {
		var children = root.childNodes;
		for (var i = 0, len = children.length; i < len; i++) {
			var node = children[i];
			if (node.hasChildNodes()) {
				outputNodeContainerEquality(node);
			} else {
				outputNodeEquality(node, node.nextSibling);
			}
		}
	}
	
	function checkNodeSize(){
		var ul = doc.querySelector("ul.nodelist-sample-list"),
			snapshotNodes = doc.querySelectorAll("ul.nodelist-sample-list li"),
			livedNodes = ul.getElementsByTagName("li");
		
		for(var i = 0, len = snapshotNodes.length; i < len; i++){
			snapshotNodes[i].parentNode.removeChild(snapshotNodes[i]);
		}
		
		return {
			snapshot : snapshotNodes.length,
			lived : livedNodes.length,
			toString : function(){
				return "snapshot NodeList length:" + 
					this.snapshot + ", lived NodeList length:" + this.lived;
			}
		};
	}
	
	(function () {
		m.addListener(m.ref("NodeOutputExecuter"), "click", outputNodeContainerInfomation);

		m.addListener(m.ref("NodeEqualityTestExecuter"), "click", function() {
			var container = m.ref("NodeEqualitySampleContainer");
			pp("***** コンテナ以下のNodeの比較 *****");
			outputNodeContainerEquality(container);
			
			var sampleNode = doc.createElement("span");
			sampleNode.id  = "SampleTestNode";
			var sampleChildNode = doc.createTextNode("SampleTestText");
			sampleNode.appendChild(sampleChildNode);
			pp("***** サンプルのNode自身と比較 *****");
			outputNodeEquality(sampleNode, sampleNode);
			pp("***** サンプルのNodeのcloneNode(true)と比較 *****");
			var clonedTrueSampleNode = sampleNode.cloneNode(true);
			outputNodeEquality(sampleNode, clonedTrueSampleNode);
			pp("***** サンプルのNodeのcloneNode(false)と比較 *****");
			var clonedFalseSampleNode = sampleNode.cloneNode(false);
			outputNodeEquality(sampleNode, clonedFalseSampleNode);
			pp("***** cloneNode(true)のidを変更して比較 *****");
			clonedTrueSampleNode.id = "Cloned" + clonedTrueSampleNode.id;
			outputNodeEquality(container, clonedTrueSampleNode);
		});
		
		var savedNodes;
		
		m.addListener(m.ref("sample-node-remover"), "click", function(){
			savedNodes = doc.querySelectorAll("ul.nodelist-sample-list li");
			var result = checkNodeSize();
			pp(result);
		}, false);
		
		m.addListener(m.ref("sample-node-resetter"), "click", function(){
			if(savedNodes){
				var ul = doc.querySelector("ul.nodelist-sample-list");
				m.appendChildAll(ul, savedNodes);
			}
		}, false);
		
		m.addListener(m.ref("node-result-clearer"), "click", function(){
			m.clear(area);
		}, false);
	}());

}(window, document, my));
