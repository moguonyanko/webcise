class InfiniteScrolling extends HTMLElement {
    constructor() {
        super();

        this.targetClassName = "content";
        this.contentNumber = 0;
        this.prevRatio = 0.0;
        // TODO: baseの高さとcontentの高さから計算して得られるはず。
        this.minContentsSize = 5;

        const shadow = this.attachShadow({mode: "open"});
        const template = document.querySelector(".infinite-scrolling");
        const content = template.content;
        shadow.appendChild(content.cloneNode(true));
    }

    get base() {
        return this.shadowRoot.querySelector(".base");
    }

    get targets() {
        return this.base.querySelectorAll(`.${this.targetClassName}`);
    }

    async createJSON() {
        const src = this.getAttribute("src");
        const res = await fetch(src);
        const json = await res.json();
        json.code = this.contentNumber++;
        const jsonText = JSON.stringify(json);
        const node = document.createTextNode(jsonText);
        const content = document.createElement("p");
        content.setAttribute("class", this.targetClassName);
        content.appendChild(node);
        return content;
    }

    removeJSON() {
        const target = this.base.querySelector(`.${this.targetClassName}:first-of-type`);
        target.parentNode.removeChild(target);
    }

    createContent(text) {
        const node = document.createTextNode(text);
        const content = document.createElement("p");
        content.setAttribute("class", this.targetClassName);
        content.appendChild(node);
        return content;
    }

    // TODO: スクロール操作が行われていない時は呼び出されないようにしたい。
    async notify(entries, observer) {
        console.log(entries, observer);

        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                const target = entry.target;
                target.parentNode.removeChild(target);
            }
        });

        if (this.targets.length < this.minContentsSize) {
            const newContent = await this.createJSON();
            this.base.appendChild(newContent);
            observer.observe(newContent);
        }
    }

    createThreshold(stepSize) {
        const gen = function* () {
            let n = 0;
            while (n <= stepSize) {
                yield n / stepSize;
                n++;
            }
        };

        return Array.from(gen());
    }

    // IntersectionObserverコンストラクタの第1引数にthis.notifyのみを指定すると
    // notify内のthisがroot(ここではthis.base)になる。
    connectedCallback() {
        const options = {
            root: this.base,
            threshold: this.createThreshold(2),
            rootMargin: "0%"
        };

        const observer =
            new IntersectionObserver((ens, obv) => this.notify(ens, obv), options);

        Array.from(this.targets).forEach(el => observer.observe(el));

        // slotで挿入された要素も無限スクロールの観察対象にする。
        const slot = this.base.querySelector("slot");
        slot.addEventListener("slotchange", event => {
            const nodes = slot.assignedNodes();
            Array.from(nodes).forEach(node => {
                Array.from(node.querySelectorAll(`.${this.targetClassName}`))
                    .forEach(el => observer.observe(el));
            });
        });
    }
}

const myObserver = {
    InfiniteScrolling
};

export default myObserver;
