export default class extends HTMLDivElement {
  #eventType = '';
  
  static #CAPTURE_EVENTS = [
    'gotpointercapture',
    'lostpointercapture'
  ];
  
  constructor() {
    super();
    
    this.#eventType = this.dataset.eventType;
    
    // built-inのcustom elementの場合、ShadowDOMを経由しなくても
    // 自身のcustom elementをカスタマイズすることが可能である。
    // built-inのcustom elementに対応していないブラウザでは以下のコードで
    // 追加している文字列が表示されない。
    const text = document.createElement('span');
    text.classList.add('infomation');
    text.appendChild(document.createTextNode('Not found event'));
    
    const result = document.createElement('div');
    result.classList.add('result');
    result.appendChild(text);
    this.appendChild(result);
    
    // built-in形式のcustom elementではslotを使用しても要素は挿入されない。
    // そもそもslotはShadowDOM側にLightDOM側の要素を反映させるための要素だったので
    // LightDOM側にcustom elementを展開するならslotを使う必要がない。
    const slot = document.createElement('slot');
    slot.setAttribute('name', 'appender');
    this.appendChild(slot);
  }
  
  // XXXpointercaptureのPointerEventは事前にsetPpointerCaptureで
  // pointerIdを登録していなければ発生しない。
  setCapture() {
    // ここでは例としてpointerdownが発生した時にpointerIdを登録している。
    this.addEventListener('pointerdown', pe => {
      this.setPointerCapture(pe.pointerId);
    });
  }
  
  isCaptureEvent(type) {
    // 名前の無いclassのstaticフィールドにはconstructorプロパティを
    // 経由してアクセスする。
    return this.constructor.#CAPTURE_EVENTS.includes(type.toLowerCase());
  }
  
  isAssignedSlot() {
    const slots = this.querySelectorAll('slot');
    return Array.from(slots).some(slot => slot.assignedNodes().length > 0);
  }
  
  connectedCallback() {
    if (this.isAssignedSlot()) {
      console.info('Slot is used');
    }
    
    const option = { 
      passive: false
    };
    
    if (this.isCaptureEvent(this.#eventType)) {
      this.setCapture();
    }
      
    this.addEventListener(this.#eventType, pe => {
      pe.preventDefault();
      
      const info = [
        `PointerEvent.type=<span class="infomation">${pe.type}</span>`,
        `(PointerEvent.x,PointerEvent.y)=(${pe.x},${pe.y})`,
        `PointerEvent.pointerId=${pe.pointerId}`,
        `PointerEvent.width=${pe.width}`,
        `PointerEvent.height=${pe.height}`,
        `PointerEvent.pressure=${pe.pressure}`,
        `PointerEvent.tangentialPressure=${pe.tangentialPressure}`,
        `PointerEvent.tiltX=${pe.tiltX}`,
        `PointerEvent.tiltY=${pe.tiltY}`,
        `PointerEvent.twist=${pe.twist}`,
        `PointerEvent.pointerType=${pe.pointerType}`,
        `PointerEvent.isPrimary=${pe.isPrimary}`
      ];
        
      this.querySelector('.result').innerHTML = info.join('<br />');
    }, option);
  }
}
