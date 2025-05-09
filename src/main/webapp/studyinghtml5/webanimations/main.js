const executeAnimation = ({element, keyframes = [],
    duration, iterations = Infinity, easing = 'ease-in'} = {}) => {
  element.animate(keyframes, {duration, iterations});
};

const initElementAnimationExample = () => {
  const root = document.querySelector('.element-animation'),
      element = root.querySelector('.animation-target');

  // TODO: transform-originが反映されない。
  const keyframes = [
    {
      transform: 'rotate(0) translate3D(-50%, -50%, 0) scale(1)',
      'transform-origin': 'center center 0',
      color: 'yellow'
    },
    {
      transform: 'rotate(180deg) translate3D(-50%, -50%, 0) scale(1.5)',
      'transform-origin': 'center center 0',
      color: 'red',
      offset: 0.3
    },
    {
      transform: 'rotate(360deg) translate3D(-50%, -50%, 0) scale(1)',
      'transform-origin': 'center center 0',
      color: 'yellow'
    }
  ];

  // mainにイベントリスナーを設定するのは流石に対象範囲が広すぎて危ないように思われる。
  root.addEventListener('change', event => {
    const et = event.target;
    if (et.dataset.eventTarget) {
      event.stopPropagation();
    }
    const type = et.dataset.eventTarget;
    if (type === 'duration') {
      const duration = parseInt(et.value);
      // それ以前のAnimationは上書きして実行される。
      executeAnimation({element, keyframes, duration});
    }
  });

  executeAnimation({element, keyframes, duration: 3000});
};

window.addEventListener('DOMContentLoaded', () => {
  initElementAnimationExample();
});
