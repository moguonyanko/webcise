/**
 * @fileOverview サードパーティCookie調査用スクリプト
 */

const getNumber = async () => {
  const options = {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-requested-with': 'I want prefreight request'
    }    
  };
  const res = await fetch('https://myhost/webcise/IncrementNumber', options);
  const json = await res.json();
  return json.number;
};

const runTest = async () => {
  const num = await getNumber();
  console.log(num);
};

const funcs = {
  requestNumber: async () => {
    const num = await getNumber();
    const output = document.querySelector('.example.increment-number .output');
    output.textContent = num;
  }
};

const addListener = () => {
  const main = document.querySelector('main');
  main.addEventListener('click', async event => {
    const {eventTarget} = event.target.dataset;
    if (typeof funcs[eventTarget] === 'function') {
      event.stopPropagation();
      await funcs[eventTarget]();
    }
  });
};

const main = async () => {
  //await runTest();
  addListener();
};

main().then();
