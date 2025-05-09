/**
 * @fileOverview Feature Policy調査用スクリプト
 */

const syncLoad = () => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status < 400) {
          const json = JSON.parse(xhr.responseText);
          resolve(json);
        } else {
          reject(new Error(xhr.statusText));
        }
      }
    };
    xhr.onerror = reject;
    // Feature Policyに違反させるため同期リクエストを行う。
    // Feature-Policyヘッダで禁止されている場合リクエストを送信する前にエラーとなる。
    const isAsync = false;
    xhr.open('GET', 'sample.json', isAsync);
    xhr.send(null);
  });
};

const useGeolocation = withPermission => {
  return new Promise(async (resolve, reject) => {
    if (withPermission) {
      // revokeは2019/04/09時点のChrome Canaryでも使用できない。
      if (typeof navigator.permissions.revoke === 'function') {
        const result = await navigator.permissions.revoke({name: 'geolocation'});
        console.log(`Is geolocation revoked?: ${result.state}`);
      } else {
        reject(new Error('navigator.permissions.revoke is not supported'));
        return;
      }
    }
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

// DOM

const listeners = {
  async syncxhr() {
    const base = document.querySelector('.sample.syncxhr'),
        result = base.querySelector('.result.syncxhr');
    try {
      const json = await syncLoad();
      result.innerHTML = JSON.stringify(json);
    } catch (err) {
      result.innerHTML = err.message;
    }
  },
  async geolocation() {
    const base = document.querySelector('.sample.geolocation'),
        resultArea = base.querySelector('.result.geolocation'),
        withPermission = base.querySelector('.permission.geolocation').checked;
    
    const nowAllowed = document.featurePolicy.allowsFeature('geolocation');
    console.log(`Is geolocation allowed in ${location.host}?: ${nowAllowed}`);
    
    try {
      const pos = await useGeolocation(withPermission);
      const c = pos.coords;
      resultArea.innerHTML = `(経度, 緯度) = (${c.longitude}, ${c.latitude})`;
    } catch (err) {
      resultArea.innerHTML = err.message;
    }
  }
};

const addListener = () => {
  const main = document.querySelector('main');
  main.addEventListener('pointerup', async event => {
    const target = event.target.dataset.eventTarget;
    if (target) {
      event.stopPropagation();
      await listeners[target]();
    }
  });
};

const dumpSupportedFeatures = () => {
  const fp = document.featurePolicy;
  if (fp) {
    const result = document.querySelector('.result.features');
    result.innerHTML = fp.features().join('<br />');
  }
};

const init = () => {
  addListener();
  dumpSupportedFeatures();
};

window.addEventListener('DOMContentLoaded', init);
