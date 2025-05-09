const allSetteled = async ({promises, allResults}) => {
  if (typeof Promise.allSettled !== 'function') {
    throw new Error('Promise.allSettled is unsupported');
  }
  // allSettledにより本来ならrejectされるPromiseを含んでいても全ての結果が返される。
  const results = await Promise.allSettled(promises);
  if (!allResults) {
    return results.filter(result => {
      // fulfilledやrejectedはPromiseの仕様で定義されたキーワードである。
      // https://tc39.github.io/proposal-promise-allSettled/
      if (result.status === 'fulfilled') {
        const response = result.value;
        return response.ok;
      } else {
        return false;
      }
    }).map(result => result.value);
  } else {
    return results.map(result => result.value);
  }
};

const loadSampleImage = async allResults => {
  const promises = [
    fetch('sample_shape_0.png'),
    fetch('sample_shape_notfound.png'),
    fetch('sample_shape_1.png')
  ];
  const responses = await allSetteled({promises, allResults})
  // Promise.allでないとImageの配列ではなくPromiseの配列が返されてしまう。
  // results.map(async response => await response.blob());
  return await Promise.all(responses.map(response => response.blob()));
};

// DOM

const listeners = {
  async loadImage(base) {
    const imgs = await loadSampleImage();

    const bitPromises = imgs.map(img => createImageBitmap(img));
    const bitmaps = await Promise.all(bitPromises);
    
    // 本来ならここでImageBitMapを加工したりする。

    const targetCanvas = base.querySelector('.outputimage');
    // 同一Canvasに対して一度でも先ににgetContextされているとtransferControlToOffscreenでエラーになる。
    // このエラーを回避するためにcloneNodeしている。
    const offscreenCanvas = targetCanvas.cloneNode(true).transferControlToOffscreen();
    const offscreenContext = offscreenCanvas.getContext('bitmaprenderer');
    // transferFromImageBitmapはImageBitmapRenderingContextのメソッド
    bitmaps.forEach(bitmap => offscreenContext.transferFromImageBitmap(bitmap));
    // transferToImageBitmapはOffscreenCanvasのメソッド
    // 少なくともFirefoxではOffscreenCanvasを直接別のCanvasにdrawImageできない。
    const targetContext = targetCanvas.getContext('2d');
    targetContext.drawImage(offscreenCanvas.transferToImageBitmap(), 0, 0);
  }
};

const addListener = () => {
  const base = document.querySelector('.extension.allsettled');
  base.addEventListener('pointerup', async event => {
    const target = event.target.dataset.eventTarget;
    if (target) {
      event.stopPropagation();
      if (typeof listeners[target] === 'function') {
        try {
          await listeners[target](base);
        } catch (err) {
          alert(err.message);
          throw err;
        }
      }
    }
  })
};

window.addEventListener('DOMContentLoaded', () => {
  addListener();
});
