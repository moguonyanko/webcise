((window, document) => {
    "use strict";
    
    const getParts = baseClass => {
        const base = document.querySelector(`.${baseClass}`);

        if (!base) {
            return {};
        }

        const output = base.querySelector(".output"),
                run = base.querySelector(".run"),
                clear = base.querySelector(".clear");

        return { output, run, clear };
    };
    
    const samples = {
        objectSpread() {
            const base = document.querySelector(".object-spread"),
                output = base.querySelector(".output"),
                run = base.querySelector(".run"),
                clear = base.querySelector(".clear");
                
            const getSampleObject = () => {
                const obj1 = {
                    "foo": 100,
                    "bar": 200
                };
                const obj2 = {
                    "baz": 300
                };
                const obj12 = {...obj1, ...obj2};
                return obj12;
            };
            
            run.addEventListener("click", () => {
                const obj = getSampleObject();
                output.innerHTML += JSON.stringify(obj) + "<br />";
            });
            
            clear.addEventListener("click", () => {
                output.innerHTML = "";
            });
        },
        objectRest() {
            const { output, run, clear } = getParts("object-rest-destructuring");
            
            const getSampleObject = () => {
                const { foo, bar, ...baz } = {
                    foo: 100,
                    bar: 200,
                    a: "Hello",
                    b: "My",
                    c: "JavaScript"
                };
                return { foo, bar, baz };
            };
            
            run.addEventListener("click", () => {
                const obj = getSampleObject();
                output.innerHTML += JSON.stringify(obj) + "<br />";
            });
            
            clear.addEventListener("click", () => {
                output.innerHTML = "";
            });
        }
    };
    
    window.addEventListener("DOMContentLoaded", () => {
        Object.values(samples).forEach(func => func());
    });
})(window, document);
