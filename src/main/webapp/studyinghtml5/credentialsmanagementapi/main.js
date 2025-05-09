const savePassword = async ({type = 'password', id, password}) => {
  const cred = new PasswordCredential({
    type,
    id,
    name: id, // とりあえずnameはidと同じにしている。
    password
  });
  const result = await navigator.credentials.store(cred);
  return result;
};

class AuthenticationError extends Error {
  constructor(message = 'Authentiation Error') {
    super(message);
  }
}

const getPassword = async () => {
  const cred = await navigator.credentials.get({password: true});
  if (!cred) {
    throw new AuthenticationError();
  }
  return cred;
};

// DOM

class CredentialForm extends HTMLFormElement {
  type = 'password';

  constructor() {
    super();

    // 以下のやり方ではformに設定されていたユーザーのイベントリスナを上書きしてしまう。
    //this.onclick = this.clicked.bind(this);
    if (this.hasAttribute('type')) {
      this.type = this.getAttribute('type');
    }
  }

  async saveCredential() {
    const id = this.querySelector('input.userid').value,
        password = this.querySelector('input.password').value;

    const result = await savePassword({
      type: this.type,
      id,
      password
    });
    console.log(result);
  }

  async getCredential() {
    const result = await getPassword();
    console.log(result);
  }

  async clicked(event) {
    const t = event.target;

    if (t.classList.contains('action')) {
      event.stopPropagation();
    }

    try {
      if (t.classList.contains('save')) {
        await this.saveCredential();
      } else if (t.classList.contains('get')) {
        await this.getCredential();
      } else {
        // Does nothing.
      }
    } catch (err) {
      if (typeof this.onerror === 'function') {
        this.onerror(err);
      } else {
        throw err;
      }
    }
  }

  connectedCallback() {
    this.addEventListener('click', this.clicked.bind(this));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  customElements.define('credential-form', CredentialForm, {extends: 'form'});
  
  const form = document.querySelector(`form[is='credential-form']`);
  // &&の右側は()で囲んでいないとシンタックスエラーになる。
  // =より&&の方が演算子の優先順位が高いため。
  form && (form.onerror = err => alert(err.message));
});
