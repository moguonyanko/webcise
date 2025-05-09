(function (win, doc, loc) {
    "use strict";

    var history = win.history,
            count = 0;
            
    const prefix = "HistoryTest";

    function updateHrefView() {
        var view = doc.getElementById("HrefView");
        view.innerHTML = '<span>' + loc.href + '</span>';
    }

    const getSuffix = () => Math.abs(count % 2);

    function addEventListener() {
        var pushBtn = doc.getElementById("HisotryPushButton");
        pushBtn.addEventListener("click", function (evt) {
            count += 1;
            history.pushState({
                styleId: prefix + getSuffix()
            }, "Push History Test",
                    "?stylechange" + count);
        }, false);

        var replaceBtn = doc.getElementById("HisotryReplaceButton");
        replaceBtn.addEventListener("click", function (evt) {
            count += 1;
            /** 
             * replaceStateであれば履歴を汚染しないので
             * 戻るボタンですぐ前のページに戻したりできる。 
             * ただしブラウザの履歴にはreplaceStateしたURLが追加される。
             */
            history.replaceState({
                styleId: prefix + getSuffix()
            }, "Replce History Test",
                    "?stylechange" + count);
        }, false);

        win.addEventListener("popstate", function (evt) {
            count -= 1;
            var el = doc.getElementById("HistorySampleElement");
            var nowClass = el.getAttribute("class");
            if (nowClass) {
                el.classList.remove(nowClass);
            }
            var stateData = evt.state;
            /* 履歴を辿り切るとstateプロパティはnullになる。 */
            if (stateData) {
                el.classList.add(stateData.styleId);
            } else {
                el.classList.add(prefix + getSuffix());
            }
        }, false);

        var btns = doc.querySelectorAll(".HistoryButton");
        for (var i = 0, len = btns.length; i < len; i++) {
            btns[i].addEventListener("click", updateHrefView, false);
        }
    }

    function init() {
        addEventListener();
    }

    win.addEventListener("DOMContentLoaded", init);
}(window, document, location));
