class Foo {
}

Foo.prototype.getThis = () => {
  return this;
};

Foo.prototype.getThisFunc = function () {
  return this;
};

class Bar {
  getThis() {
    return this;
  }
}

const tests = {
  'window === globalThis': () => window === globalThis,
  'this === globalThis': () => this === globalThis,
  'new Foo().getThis() === globalThis': () => {
    return new Foo().getThis() === globalThis;
  },
  'new Foo().getThisFunc() === globalThis': () => {
    return new Foo().getThisFunc() === globalThis;
  },
  'new Bar().getThis() === globalThis': () => {
    return new Bar().getThis() === globalThis;
  }
};

const tasks = {
  runWorker() {
    return new Promise((resolve, reject) => {
      const worker = new Worker('worker.js');
      worker.onmessage = event => {
        resolve(event.data);
      };
      worker.onerror = reject;
      worker.postMessage(['Hello', 'My', 'Worker']);
    });
  },
  runSharedWorker() {
    return new Promise((resolve, reject) => {
      if (typeof SharedWorker !== 'function') {
        reject(new Error('SharedWorker is undefined'));
        return;
      }
      const worker = new SharedWorker('sharedworker.js');
      worker.port.onmessage = event => {
        resolve(event.data);
      };
      worker.port.onerror = reject;
      worker.port.postMessage([10, 20, 30, 40, 50]);
    });
  }
};

const runTest = () => {
  console.log(globalThis);
};

// DOM

const initWorkerExample = () => {
  const bases = document.querySelectorAll('.worker.example');
  bases.forEach(base => {
    base.addEventListener('pointerup', async event => {
      const resultArea = base.querySelector('.resultarea');
      if (event.target.classList.contains('target')) {
        event.stopPropagation();
        if (typeof tasks[event.target.value] === 'function') {
          try {
            const result = await tasks[event.target.value]();
            resultArea.value = result;
          } catch (err) {
            resultArea.value = err.message;
          }
        }
      }
    });
  });
};

const dumpThisInfo = () => {
  let resultArea = document.querySelector('.resultarea');
  Object.keys(tests).forEach(testName => {
    resultArea.value += `${testName}: ${tests[testName]()}\n`;
  })
};

const init = () => {
  runTest();
  dumpThisInfo();
  initWorkerExample();
};

console.log(`window === globalThis: ${window === globalThis}`);
globalThis.addEventListener('DOMContentLoaded', init);
