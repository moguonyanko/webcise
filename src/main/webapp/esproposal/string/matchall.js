/**
 * 参考:
 * http://kangax.github.io/compat-table/esnext/
 * https://github.com/tc39/proposal-string-matchall
 */

class StringMatcher extends HTMLInputElement {
  pattern = /./g;

  constructor() {
    super();

    let attr = 'g';
    if (this.hasAttribute('data-ignorecase')) {
      attr += 'i';
    }
    this.pattern = new RegExp(this.dataset.pattern, attr);
    this.onkeyup = this.keyupped.bind(this);
  }

  keyupped(event) {
    const it = this.value.matchAll(this.pattern);
    let step;
    let matched = [];
    while (!(step = it.next()).done) {
      matched = matched.concat(step.value);
    }
    this.dataset.matched = matched.join(' ');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  customElements.define('matcher-input', StringMatcher, {extends: 'input'});
  
  const matcherExample = document.querySelector('.matcher.example');
  matcherExample.addEventListener('keyup', event => {
    const t = event.target;
    if (t.classList.contains('eventtarget')) {
      event.stopPropagation();
    }
    if (t.getAttribute('is') === 'matcher-input') {
      const matched = t.dataset.matched;
      matcherExample.querySelector('.matched').value = matched;
    }
  });
});
