((win, doc) => {
    "use strict";

    const sample = doc.querySelector(".enumerableproperty-sample");
    const output = sample.querySelector(".output");
    
    const display = content => {
        output.innerHTML += content + "<br />";
    };
    
    const baseObj = Object.defineProperties({}, {
        id: {
            value: "BASE", 
            writable: false, 
            enumerable: false, 
            configurable: true
        }
    });
    
    const shadowObj = Object.defineProperties(baseObj, {
        id: {
            value: "SHADOW", 
            writable: false, 
            enumerable: false, 
            configurable: true
        }
    });
    
    const desc = (obj, name) => Object.getOwnPropertyDescriptor(obj, name);
    
    const inspect = obj => JSON.parse(JSON.stringify(obj));
    
    const checkProperty = () => {
        let result = true;
        Object.prototype.length = 12345;
        display(`Object length: ${JSON.stringify(desc(Object, "length"))}`);
        display(`Function length: ${JSON.stringify(desc(Function, "length"))}`);
        // Functionのlengthがenumerable=falseなら以下のfor文では列挙されないはず。
        // しかし一部のブラウザでは列挙されてしまう。
        for (let name in Function) {
            console.log(name);
            if (name === "length") {
                result = false;
            }
        }
        delete Object.prototype.length;
        return result;
    };
    
    const init = () => {
        const run = sample.querySelector(".run"),
              reset = sample.querySelector(".reset");

        run.addEventListener("click", () => {
            display(`${checkProperty() ? "列挙されない" : "列挙された"}`);
        });
        
        reset.addEventListener("click", () => output.innerHTML = "");
    };
    
    win.addEventListener("DOMContentLoaded", init);
})(window, document);
