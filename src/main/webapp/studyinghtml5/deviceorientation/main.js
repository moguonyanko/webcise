(() => {
    "use strict";

    // window等のエイリアスをconstやletで宣言したい場合は外側の関数の引数宣言部ではなく
    // 関数内部で宣言するしかない。
    const {win, doc, loc, nav} = {
        win: window,
        doc: document,
        loc: location,
        nav: navigator
    };

    const println = (ele, txt) => ele.innerHTML += `${txt}<br />`;
    const clear = ele => ele.innerHTML = "";

    class DeviceOrientationSample {
        constructor() {
            const base = doc.querySelector(".device-orientation-sample");
            const clearer = base.querySelector(".clear");
            this.output = base.querySelector(".output");
            this.turner = base.querySelector(".detect");

            clearer.addEventListener("click", () => clear(this.output));
            this.turner.addEventListener("click", () => this.turnDetection());
            // メソッドをイベントハンドラとして直接指定するとメソッド内のthisが
            // イベントハンドラを設定された要素そのものになる。以下のコードにおいて
            // turnDetectionの内部ではthisがclickされたbutton要素になってしまう。
            //this.turner.addEventListener("click", this.turnDetection);

            this.detecting = false;
            // 「同じ変数で」参照されるイベントハンドラを何回addEventListenerしても
            // イベントハンドラは1回しか実行されない。しかし「同じ処理の」イベント
            // ハンドラはaddEventListenerされた回数だけ実行される。
            // 例えば以下のコードで右辺のアロー関数をaddEventListenerの第2引数に
            // 指定すると，addEventListenerした回数だけハンドラが実行されてしまう。
            this.detectHandler = event => this.detect(event);
        }
        detect(event) {
            const {absolute, alpha, beta, gamma} = event;
            const txt = `
                absolute:${absolute},X軸=${beta},Y軸=${gamma},Z軸=${alpha}
            `;
            this.output.innerHTML = txt;
        }
        turnDetection() {
            if (!this.detecting) {
                win.addEventListener("deviceorientation", this.detectHandler);
            } else {
                win.removeEventListener("deviceorientation", this.detectHandler);
            }
            this.detecting = !this.detecting;
            this.turner.classList.toggle("detecting");
        }
    }

    class DeviceMotionSample {
        constructor() {
            const base = doc.querySelector(".device-motion-sample");
            this.output = base.querySelector(".output");
            const motionChecker = event => this.detectMotion(event);
            const enableMotionCheck = base.querySelector(".enable-motion-check");
            enableMotionCheck.addEventListener("click", () => {
                if (enableMotionCheck.checked) {
                    win.addEventListener("devicemotion", motionChecker);
                } else {
                    win.removeEventListener("devicemotion", motionChecker);
                }
            });
        }
        detectMotion(event) {
            const p = event.acceleration;
            const g = event.accelerationIncludingGravity;
            const {alpha, beta, gamma} = event.rotationRate;
            const interval = event.interval;

            this.output.innerHTML = `
                    加速度(x,y,z)=(${p.x},${p.y},${p.z}),<br />
                    加速度:重力考慮(x,y,z)=(${g.x},${g.y},${g.z}),<br />
                    回転角度(x,y,z)=(${beta},${gamma},${alpha}),<br />
                    モーション間隔(ms)=${interval}
                `;
        }
    }

    const init = () => [
            DeviceOrientationSample,
            DeviceMotionSample
        ].forEach(Sample => new Sample);

    win.addEventListener("DOMContentLoaded", init);
})();
