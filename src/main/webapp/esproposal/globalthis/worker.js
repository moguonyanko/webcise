/**
 * globalThis調査用Worker
 */

self.onmessage = event => {
  console.log(`self === globalThis: ${self === globalThis}`);
  // Worker内でwindowは参照できない。
  //console.log(`window === globalThis: ${window === globalThis}`);
  globalThis.postMessage(`Joined by worker: ${event.data.join(' ')}`);
};
