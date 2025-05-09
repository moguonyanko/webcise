class TextCounter extends HTMLInputElement {
  static #COUNTER_ID = 'my-text-counter';
  
  constructor() {
    super();
    
    const t = document.createElement('template');
    t.innerHTML = `<span id="${this.constructor.#COUNTER_ID}">${this.value.length}</span>`;
    const el = t.content.cloneNode(true).firstChild;
    
    this.insertAdjacentElement('afterend', el);
  }
  
  connectedCallback() {
    this.addEventListener('input', event => {
      const counter = document.getElementById(this.constructor.#COUNTER_ID);
      counter.innerHTML = this.value.length;
    });
  }
}

class ColorMaker extends HTMLElement {
  constructor() {
    super();
    
    const shadow = this.attachShadow({ mode: 'open' });
    const t = document.getElementById('color-maker');
    shadow.appendChild(t.content.cloneNode(true));
  }
  
  connectedCallback() {
    const root = this.shadowRoot;
    root.addEventListener('change', event => {
      if (event.target.dataset.eventTarget) {
        event.stopPropagation();
        const colorValues = Array.from(root.querySelectorAll('.color'))
            .map(ele => ele.value);
        const color = `rgb(${colorValues.join(',')})`;
        const colorTarget = root.getElementById('color-target');
        colorTarget.style.backgroundColor = color;
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  customElements.define('my-counter', TextCounter, { extends: 'input' });
  // 同じコンストラクタを別名で再度登録はできない。
  //customElements.define('text-counter', TextCounter, { extends: 'input' });
  
  customElements.define('my-color', ColorMaker);
  // autonomousであっても同様に別名で再度登録はできない。
  //customElements.define('custom-color', ColorMaker);
});
