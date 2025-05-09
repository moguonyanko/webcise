class InputEncoder extends HTMLInputElement {
  #encoder = new TextEncoder();
  
  constructor() {
    super();
  }
  
  connectedCallback() {
    this.addEventListener('keyup', event => {
      const result = this.#encoder.encode(this.value);
      if (typeof this.ontextencoded === 'function') {
        this.ontextencoded(result);
      }
    });
  }
}

class InputDecoder extends HTMLInputElement {
  #decoder = new TextDecoder(); // Defalut encoding UTF-8;
  
  constructor() {
    super();
    
    const encoding = this.dataset.encoding;
    if (encoding) {
      // fatalがfalseだと不適切な値をデコードしようとした時もエラーにならない。
      // 単に文字化けする。
      this.#decoder = new TextDecoder(encoding, {fatal: true});
    }
  }
  
  connectedCallback() {
    this.addEventListener('keyup', event => {
      // parseIntしなくてもsplitで得られた文字列は暗黙の型変換で数値にされる。
      const ua = Uint8Array.from(this.value.split(',').map(s => parseInt(s)));
      try {
        // 引数のUint8Arrayが大きくなければstreamプロパティの意味は無い？
        const result = this.#decoder.decode(ua, {stream: true});
        if (typeof this.ontextdecoded === 'function') {
          this.ontextdecoded(result);
        }
      } catch(err) {
        if (typeof this.onerror === 'function') {
          this.onerror(err);
        }
      }
    });
  }
}

// DOM

const addCoderListener = ({inputSelector, outputSelector, listenerName}) => {
  const eles = document.querySelectorAll(inputSelector);
  Array.from(eles).forEach(ele => {
    if (ele) {
      ele[listenerName] = result => {
        const resultArea = document.querySelector(outputSelector);
        resultArea.innerHTML = result;
      };
      ele.onerror = err => alert(err.message);
    }
  });
};

const addListener = () => {
  addCoderListener({
    inputSelector: `input[is='text-encoder']`,
    outputSelector: '.result.encoder',
    listenerName: 'ontextencoded'
  });
  addCoderListener({
    inputSelector: `input[is='text-decoder']`,
    outputSelector: '.result.decoder',
    listenerName: 'ontextdecoded'
  });
};

const init = () => {
  customElements.define('text-encoder', InputEncoder, { extends: 'input' });
  customElements.define('text-decoder', InputDecoder, { extends: 'input' });
  addListener();
};

window.addEventListener('DOMContentLoaded', init);
