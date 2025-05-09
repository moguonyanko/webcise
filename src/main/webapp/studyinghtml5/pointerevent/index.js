import PointerInfo from './pointerevent.js';

window.addEventListener('DOMContentLoaded', () => {
  customElements.define('pointer-info', PointerInfo, {extends: 'div'});
  
  // constructor経由でもprivateフィールドにはアクセスできない。
  //console.log(PointerInfo.constructor.#CAPTURE_EVENTS);
});
