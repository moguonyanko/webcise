/**
 * @fileOverview class field調査用スクリプト
 * @description 2019/03/01時点ではChromeでしか動作しない。
 */

const crypto = window.crypto,
    subtle = crypto.subtle;

// ネイティブHTML要素の拡張であればサードパーティ製ライブラリのスタイルシートも
// 適用されやすくなる。
class Greeting extends HTMLButtonElement {

  static DEFIEND_VALUES = [
    'はじめまして',
    'Good Morning',
    'おはよう',
    'Hello',
    'こんにちは',
    'Good Night',
    'おやすみなさい'
  ];

  // class内であってもstatic fieldへのアクセスはclass名の指定が必須
  value = Greeting.DEFIEND_VALUES[0];

  constructor() {
    super();

    // renderがオーバーライドされると危険
    this.render();

    this.onclick = this.clicked.bind(this);
  }

  clicked() {
    const index = Math.floor(Math.random() * Greeting.DEFIEND_VALUES.length);
    this.value = Greeting.DEFIEND_VALUES[index];
    window.requestAnimationFrame(this.render.bind(this));
  }

  render() {
    this.textContent = this.value;
  }
}

class UserInfo extends HTMLFormElement {
  #userId = 'no name';
  #password = 'no password';
  
  static #HASHFUNC = 'SHA-256';
  static #ALGORITHM = 'AES-GCM';
  
  #hash = async () => {
    const encoder = new TextEncoder();
    const pwBuffer = encoder.encode(this.#password);
    return await subtle.digest(UserInfo.#HASHFUNC, pwBuffer);
  };
  
  #encryptData = async (size = 32) => {
    const algorithm = {
      name: UserInfo.#ALGORITHM, 
      iv: crypto.getRandomValues(new Uint8Array(size))
    };
    
    const key = await subtle.importKey("raw", await this.#hash(), algorithm, 
                     false, ["encrypt"]);

    const inputData = this.querySelector('.data').value;
    const src = new TextEncoder().encode(inputData);
    return await subtle.encrypt(algorithm, key, src);
  };

  constructor() {
    super();
    // private field先頭の#は書き込み時も読み取り時も必須
    this.#userId = this.querySelector('input.userId').value;
    this.#password = this.querySelector('input.password').value;
  }
  
  get state() {
    return `${this.#userId} is active`;
  }
  
  async getMyData() {
    const d = await this.#encryptData();
    return new Uint8Array(d).join(" ");
  }
  
  // 現状ではメソッドの先頭に#を指定して宣言するのはシンタックスエラーとなる。
  // #myMethod() {}
}

class Car {
  #speed = 0; // km
  
  // デフォルト引数を指定していなくてもサブクラスからコンストラクタが呼び出される。
  // コンストラクタのオーバーロードが許可されないのでどのコンストラクタが呼び出されるか
  // 考えさせられることはない。
  constructor(speed = 0) { 
    this.#speed = speed;
    console.log(`Car initialized received speed = ${speed}`);
  }
  
  speedUp(speed) {
    this.#speed += speed;
  }
  
  get speedAnMinute() {
    return this.#speed / 60;
  }
}

class Truck extends Car {
  #baggage = [];

  // サブクラスのコンストラクタを記述しなくてもスーパークラスのコンストラクタが呼ばれる。
//  constructor(speed){
//    super(speed);
//  }
  
  hasBaggage() {
    return this.#baggage.length > 0;
  }
  
  addBaggage(name, item) {
    this.#baggage.push([name, item]);
  }
  
  get baggageEntries() {
    return Object.fromEntries(this.#baggage);
  }
}

const appendGreetingButton = () => {
  // createElementの引数にisを指定したオブジェクトを渡せばcustom elementの
  // コンストラクタが呼び出される。
  const btn = document.createElement('button', {is: 'greeting-button'});
  // 同じ処理を以下の記述でも行える。
  //const btn = new Greeting();

  // 「.public-field .container」の間のスペースが無いと両方のclassが指定された
  // 1つの要素を探してしまう。
  // 例: <div class="public-field container"></div>
  const container = document.querySelector('.public-field .container');
  container.appendChild(btn);
}

const addListener = () => {
  const publicEx = document.querySelector('.public-field.example');
  publicEx.addEventListener('click', event => {
    const t = event.target;
    if (t.classList.contains('eventtarget')) {
      event.stopPropagation();
    }
    if (t.value === 'appendGreetingButton') {
      appendGreetingButton();
    }
  });
  
  const privateEx = document.querySelector('.private-field.example');
  privateEx.addEventListener('click', async e => {
    const t = e.target;
    if (t.classList.contains('.target')) {
      e.stopPropagation();
    }
    
    const ui = document.querySelector(`form[is='user-info']`);
    
    // private staticなのでclass外から参照すると実行前であってもシンタックスエラーとなる。
    //console.log(UserInfo.#HASHFUNC);
    
    if (t.classList.contains('encryptData')) {
      // privateで宣言された関数も外部から参照すると実行前にシンタックスエラーとされる。
      //console.log(ui.#encryptData());
      const data = await ui.getMyData();
      alert(data);
    } else if(t.classList.contains('displayUserState')) {
      // private fieldなのでclass外からのアクセスはシンタックスエラー。
      //console.log(ui.#userId);
      //console.log(ui.#password);
      alert(ui.state);
    }
  });
};

const dumpSubclassingInfo = () => {
  const resultArea = document.querySelector('.resultarea');
  
  const truck = new Truck();
  const info = [];
  info.push(`Has baggage? : ${truck.hasBaggage()}`);
  info.push(`Truck speed ${truck.speedAnMinute} (km/minute)`);
  truck.addBaggage('My Choco', {price: 100});
  truck.addBaggage('Your orange', {price: 200});
  truck.addBaggage('My pen', {price: 120});
  info.push(Object.keys(truck.baggageEntries));
  info.push(`Has baggage? : ${truck.hasBaggage()}`);
  truck.speedUp(100);
  info.push(`Truck speed ${truck.speedAnMinute} (km/minute)`);
  
  resultArea.value = info.join('\n');
};

const init = () => {
  customElements.define('greeting-button', Greeting, {extends: 'button'});
  customElements.define('user-info', UserInfo, {extends: 'form'});
  
  addListener();
  
  dumpSubclassingInfo();
};

window.addEventListener('DOMContentLoaded', init);
