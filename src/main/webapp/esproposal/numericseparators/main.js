/**
 * @fileOverview Numeric Separators調査用スクリプト
 * 
 */

const getDecimalLiterals = () => {
  const literals = new Map();
  
  literals.set('1_000_000', 1_000_000);
  literals.set('100.000_000_001', 100.000_000_001);
  literals.set('1e1_0', 1e1_0);
  literals.set('0b0000_0000_0000_0001', 0b0000_0000_0000_0001);
  literals.set('0x00_00_01', 0x00_00_01);
  literals.set('0o0_0_0_1', 0o0_0_0_1);
  literals.set(`Number('1' + 1_00)`, Number('1' + 1_00));
  literals.set(`Number('11_00')`, Number('11_00'));
  literals.set(`Number('1' + 1.0_1)`, Number('1' + 1.0_1));
  literals.set(`Number('11.0_1')`, Number('11.0_1'));
  literals.set(`BigInt('1' + 1_00)`, BigInt('1' + 1_00));
  try {
    literals.set(`BigInt('11_00')`, BigInt('11_00'));
  } catch(err) {
    literals.set(`BigInt('11_00')`, err.message);
  }
  
  return literals;
};

// DOM

const getElementFromString = str => {
  const t = document.createElement('template');
  t.innerHTML = str;
  return t.content.cloneNode(true);
};

class NumericLiteralsView extends HTMLDivElement {
  constructor() {
    super();
    
    const literals = getDecimalLiterals();
    
    const fragment = Array.from(literals.keys())
        .map(key => {
        const literal = literals.get(key);
        return `<p>${key} : <span class="literal">${literal}</span></p>`;
      }).reduce((acc, current) => {
        // DocumentFragmentのinnerHTMLに文字列を追加しても要素は追加されない。
        acc.appendChild(getElementFromString(current));
        return acc;
      }, document.createDocumentFragment());
    
    this.appendChild(fragment);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  customElements.define('numeric-literals', NumericLiteralsView, { extends: 'div' });
});
