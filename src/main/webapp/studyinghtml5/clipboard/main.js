((window, document) => {
    "use strict";
    
    const samples = {
        textCopypasteSample() {
            const base = document.querySelector(".text-copypaste-sample"),
                sampleText = base.querySelector(".sample-text"),
                resultArea = base.querySelector(".result-area");
            
            const copyListener = event => {
                event.clipboardData.setData("text/plain", `Copy: ${sampleText.value}`);
                event.preventDefault();
            };
            
            document.addEventListener("copy", copyListener);
            
            const pasteListener = event => {
                const data = event.clipboardData.getData("text");
                console.log(data);
                resultArea.innerHTML += `${data} <br />`;
            };
            
            document.addEventListener("paste", pasteListener);
        }
    };
    
    window.addEventListener("DOMContentLoaded", () => {
        Object.keys(samples).forEach(key => samples[key]());
    });
})(window, document);