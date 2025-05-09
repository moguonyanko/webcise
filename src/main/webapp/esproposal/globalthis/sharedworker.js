/**
 * globalThis調査用SharedWorker
 * SharedWorker内のコードChromeでデバッグするには以下にアクセスする。
 * chrome://inspect/#workers
 */

globalThis.onconnect = event => {
  console.log(`self === globalThis: ${self === globalThis}`);
  const port = event.ports[0];
  port.onmessage = e => {
    port.postMessage(e.data.reduce((acc, current) => acc + current, 0));
  };
};
