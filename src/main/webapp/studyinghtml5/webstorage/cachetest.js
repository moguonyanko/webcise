((window, document) => {
    "use strict";
    
    const localStorage = window.localStorage;
    
    const samples = {
        cacheTest() {
            const base = document.querySelector(".storage-cache-test");
            const setter = base.querySelector(".settext"),
                getter = base.querySelector(".gettext"),
                remover = base.querySelector(".removetext"),
                inputText = base.querySelector(".inputtext");
                
            const key = "cacheTestKey";   
            
            const setItem = ({key, item}) => {
                localStorage.setItem(key, item);
            };
                
            const getItem = ({key}) => {
                return localStorage.getItem(key);
            };    
            
            const removeItem = ({key}) => {
                localStorage.removeItem(key);
            };
            
            setter.addEventListener("click", () => {
                setItem({key, item: inputText.value});
            });
            
            getter.addEventListener("click", () => {
                const value = getItem({key});
                inputText.value = value || "no data";
            });
            
            remover.addEventListener("click", () => {
                removeItem({key});
            });
        }
    };
    
    const init = () => {
        Object.keys(samples).forEach(key => samples[key]());
    };
    
    window.addEventListener("DOMContentLoaded", init);
})(window, document);