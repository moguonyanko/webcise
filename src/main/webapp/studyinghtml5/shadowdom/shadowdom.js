(function (win, doc, m) {
    "use strict";

    /**
     * @private
     * @name shadowRoots
     * @type Object
     * @description
     * 一度createShadowRootを呼び出した要素に対し再度createShadowRootを
     * 呼び出すとChrome48では警告される。これを回避するためcreateShadowRootの
     * 戻り値をキャッシュしておく。
     */
    var shadowRoots = {};

    function appendToShadowDOM(shadowId, htmlInfo, cssInfo) {
        var shadowRoot;

        if (shadowId in shadowRoots) {
            shadowRoot = shadowRoots[shadowId];
        } else {
            shadowRoot = m.ref(shadowId).createShadowRoot();
            shadowRoots[shadowId] = shadowRoot;
        }

        var textNode = doc.createTextNode(htmlInfo.text);
        var container = doc.createElement(htmlInfo.tagName);
        container.appendChild(textNode);
        shadowRoot.appendChild(container);

        var css = m.makeCSS(cssInfo.selector, cssInfo.style, true);
        shadowRoot.innerHTML += css;

        return shadowRoot;
    }

    function init() {
        var shadowRootId = "my-shadow-root";

        m.clickListener("add-to-shadow-dom", function (evt) {
            function func() {
                var inputTagName = m.ref("input-tag-name").value;

                var htmlInfo = {
                    tagName: inputTagName,
                    text: m.ref("input-add-element").value
                };

                var varName = "--shadow-font-color";
                var defaultColor = "grey";
                /**
                 * CSS Variablesの値が得られない時はvar関数の第2引数が使用される。
                 */
                var fontColor = "var(" + varName + ", " + defaultColor + ")";

                var cssInfo = {
                    selector: inputTagName,
                    style: {
                        color: fontColor
                    }
                };

                return appendToShadowDOM(shadowRootId, htmlInfo, cssInfo);
            }

            function resolve(shadowRoot) {
                m.log(shadowRoot);
            }

            function reject(err) {
                var msg = "Shadow DOMに要素を追加できませんでした。:" + err;
                m.error(msg);
                m.println(m.ref("info-area"), msg);
            }

            m.fulfill(func, resolve, reject);
        });

        m.clickListener("clear-shadow-dom", function (evt) {
            if (shadowRoots[shadowRootId]) {
                shadowRoots[shadowRootId].innerHTML = "";
            }
        });
        
		m.clickListener("clear-info-area", function () {
			m.clear(m.ref("info-area"));
		});
    }

    init();
}(window, document, my));
