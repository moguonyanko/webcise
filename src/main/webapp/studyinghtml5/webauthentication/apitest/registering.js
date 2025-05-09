/**
 * private fieldやbuilt-in形式のCustom ElementsはChrome以外のブラウザでの実装が
 * 進むまでは使用を控える。PointerEventもSafariでは最新の開発版でないと使用できない。
 */

const createRandomString = async () => {
  const response = await fetch('/webcise/RandomString');
  if (!response.ok) {
    throw new Error('Cannot get random string');
  }
  const json = await response.json();
  return json.value;
};

const createCredencial = async ({userName, userDisplayName, authenticatorAttachment}) => {
  const serverRandomValue = await createRandomString();
  // userのidをどのように生成するのが好ましいのかが分かっていない。
  // ここではchallengeに渡す文字列と同じ方法で生成することにしている。
  const userRandomValue = await createRandomString();

  const publicKey = {
    challenge: Uint8Array.from(serverRandomValue, c => c.charCodeAt(0)),
    rp: {
      name: "My WebAuthn Example",
      id: location.host // idが現在のページのドメインに含まれていなければDOMExceptionになる。
    },
    user: {
      id: Uint8Array.from(userRandomValue, c => c.charCodeAt(0)),
      name: userName,
      displayName: userDisplayName
    },
    pubKeyCredParams: [{
        alg: -7, // ECDSA w/ SHA-256
        type: "public-key"
      }],
    authenticatorSelection: {authenticatorAttachment},
    timeout: 10000,
    attestation: "direct" // directでは匿名化するかどうか確認される。
  };

  return await navigator.credentials.create({publicKey});
};

class PublicKeyCreator extends HTMLElement {

  constructor() {
    super();
    
    const template = document.querySelector('template.register');
    const shadow = this.attachShadow({mode: 'open'});
    shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    const root = this.shadowRoot;

    root.addEventListener('submit', event => {
      event.preventDefault();
    }, {passive: false});
    
    // pointerupなどPointerEventsはiOS Safari(ver12.1)では設定で有効化していても動作しない。
    // ShadowDOMでは振る舞いが異なるのかもしれない。
    root.addEventListener('click', async event => {
      if (event.target.classList.contains('create-publickey')) {
        event.stopPropagation();

        const userName = root.querySelector('.user-name').value,
            userDisplayName = root.querySelector('.user-display-name').value;

        const selectedAttachment = Array.from(root.querySelectorAll('.attachment'))
            .filter(el => el.checked)[0];
        const authenticatorAttachment = selectedAttachment.value;

        try {
          const credencial = await createCredencial({
            userName,
            userDisplayName,
            authenticatorAttachment
          });
          const area = root.querySelector('.credencials-info');
          area.value = credencial.toString();
        } catch (err) {
          alert(err);
          throw err;
        }
      }
    });
  }
}

const init = () => {
  customElements.define("pubkey-creator", PublicKeyCreator);
};

window.addEventListener('DOMContentLoaded', init);
