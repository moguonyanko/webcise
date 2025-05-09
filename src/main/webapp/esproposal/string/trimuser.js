// 読み込み対象moduleとなるスクリプトファイルがカレントディレクトリに配置されていたとしても
// import文のmodule-nameは必ず./で始めなければならない。
import Trimmer from "./trim.js";

const addListener = () => {
    const base = document.querySelector(".trim-example"),
        result = base.querySelector(".result"),
        container = base.querySelector(".trim-container"),
        textLength = base.querySelector(".text-length");

    container.addEventListener("click", event => {
        const value = result.value;
        const trimmer = new Trimmer(value);
        const list = event.target.classList;
        try {
            if (list.contains("trim")) {
                event.stopPropagation();
            }
            if (list.contains("trim-start")) {
                result.value = trimmer.trimStart();
            } else if (list.contains("trim-end")) {
                result.value = trimmer.trimEnd();
            }
        } catch (err) {
            alert(err.message);
        } finally {
            textLength.innerHTML = trimmer.contentLength;
        }
    });
};

addListener();
