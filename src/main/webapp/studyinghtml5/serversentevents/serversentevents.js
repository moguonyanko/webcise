((win, doc, g) => {
    "use strict";
    
    const base = "basic-sample";
    const q = selector => doc.querySelector("." + base + " " + selector);
    
    const resultArea = q(".result-area"),
        runner = q(".runner"),
        sender = q(".sender"),
        closer = q(".closer"),
        clearer = q(".clearer"),
        messager = q(".messager");
    
    const display = txt => resultArea.innerHTML += txt + "<br />";
    const clear = () => resultArea.innerHTML = "";
    const log = txt => console.log(txt);
    
    const getContextName = () => {
        const url = new URL(win.location.href);
        const paths = url.pathname.split("/");
        return paths[1] || "";
    };
    
    const getSenderUrl = (name = "ServerSender") => {
        return "/" + getContextName() + "/" + name;
    };
    
    const getMessage = () => messager.value;
    
    const onopen = evt =>  {
        log(evt);
    };
    
    const onmessage = evt =>  {
        log(evt);
        const json = JSON.parse(evt.data);
        display(json);
    };
    
    const onclose = evt =>  {
        log(evt);
    };
    
    class FetchError extends Error {
        constructor(message = "Fetch error", status) {
            this.message = message;
            this.status = status;
        }
        toJSON() {
            return {
                result: {
                    message: this.message,
                    status: this.status
                }
            };
        }
        toString() {
            return `${this.message}, status = ${this.status}`;
        }
    }
    
    const sendRequest = async (url, message = "") => {
        const method = "POST";
        const body = new FormData();
        body.append("message", message);
        const response = await fetch(url, { method, body });
        if (response.ok) {
            const result = await response.json();
            return result;
        } else {
            throw new FetchError("Request has failed", response.status);
        }
    };
    
    const addListener = () => {
        let sources = [];
    
        runner.addEventListener("click", () => {
            const url = getSenderUrl();
            const eventSource = new EventSource(url);
            Object.assign(eventSource, { onopen, onmessage, onclose });
            sources.push(eventSource);
        });
        
        sender.addEventListener("click", async () => {
            try {
                const url = getSenderUrl();
                const message = getMessage();
                const result = await sendRequest(url, message);
                display(JSON.stringify(result));
            } catch (err) {
                display(JSON.stringify(err));
            } 
        });

        closer.addEventListener("click", () => {
            sources.forEach(eventSource => {
                eventSource.close();
            });
            sources = [];
        });
        
        clearer.addEventListener("click", clear);
    };
    
    const init = () => {
        addListener();
    };
    
    win.addEventListener("DOMContentLoaded", init);
})(window, document, goma);
