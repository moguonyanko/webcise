((win, doc) => {
    "use strict";

    const display = ({target, content}) => target.innerHTML += `${content}<br />`;
    const clear = ({target}) => target.innerHTML = "";

    const exams = {
        examineMediaElementProperty() {
            const base = doc.getElementById("media-element-property");
            const info = base.querySelector(".infomation");
            const video = base.querySelector(".video-container video");
            /**
             * ObjectのメソッドではHTMLElementのプロパティを列挙することができない。
             */
            //Object.getOwnPropertyNames(video).forEach(property => display(info, 
            //    `${property}=${video[property]}`));
            //Object.keys(video).forEach(property => display(info, 
            //    `${property}=${video[property]}`));

            const networkStates = {
                [HTMLMediaElement.NETWORK_EMPTY]: "初期化未完了",
                [HTMLMediaElement.NETWORK_IDLE]: "通信なし",
                [HTMLMediaElement.NETWORK_LOADING]: "動画データダウンロード中",
                // ページがブラウザキャッシュから読み込まれるとNETWORK_NO_SOURCEになる。
                [HTMLMediaElement.NETWORK_NO_SOURCE]: "リソースなし",
            };

            const preloadStates = {
                "none": "プリロードされない",
                "metadata": "メタデータのみプリロードする",
                "auto": "全てのデータをプリロードする"
            };

            const readyStates = {
                [HTMLMediaElement.HAVE_NOTHING]: "利用可能なデータなし",
                [HTMLMediaElement.HAVE_METADATA]: "メタデータはある",
                [HTMLMediaElement.HAVE_CURRENT_DATA]: "今の位置は再生できる",
                [HTMLMediaElement.HAVE_FUTURE_DATA]: "ちょっと先まで再生できる",
                [HTMLMediaElement.HAVE_ENOUGH_DATA]: "最後まで再生できる"
            };

            const checkVideoProperties = () => {
                const propertyInfomations = [
                    `自動再生=${video.autoplay ? "有効" : "無効"}`,
                    `動画コントロール=${video.controls ? "あり" : "なし"}`,
                    `現在の再生時間(秒)=${video.currentTime}`,
                    `再生が終了したか=${video.ended}`,
                    // リンク間違いなどで動画を読み込めなかった場合でもerrorプロパティは
                    // nullになってしまう。再生に関わるエラーしか検出できないのかもしれない。
                    `エラーが発生したか=${video.error ? video.error.message : "問題なし"}`,
                    // ChromeやSafariの動画コントロールにはループを指定する要素が
                    // 存在しないので必要なら独自に用意する。
                    `ループ再生=${video.loop ? "有効" : "無効"}`,
                    `リソースのダウンロード状況=${networkStates[video.networkState]}`,
                    // とにかく動画再生中でなければpausedはtrueになる。たとえば
                    // 再生を開始していない時や再生し終わった時でもpausedはtrueになる。
                    // すなわちpausedプロパティを介してユーザーが一時停止を試みたかどうかを
                    // 判別することはできないということである。
                    `一時停止中か=${video.paused}`,
                    `再生された量を反映したTimeRqangesの長さ=${video.played.length}`,
                    // preload空文字はautoと同じ。
                    `プリロード状態=${video.preload === "" ? "auto" : preloadStates[video.preload]}`,
                    `再生状態=${readyStates[video.readyState]}`
                ];
                display({target: info, content: propertyInfomations.join("<br/>")});
            };

            checkVideoProperties();

            base.querySelector(".checker").addEventListener("click", () => {
                clear({target: info});
                checkVideoProperties();
            });

            base.querySelector(".looper").addEventListener("click", () => {
                video.loop = !video.loop;
            });
        },
        examMediaElementMethod() {
            const base = doc.getElementById("media-element-method");
            const video = base.querySelector(".sample-video");
            const customCtrls = base.querySelector(".custom-controls");

            customCtrls.querySelector(".play").addEventListener("click", () => {
                video.play();
            });

            customCtrls.querySelector(".pause").addEventListener("click", () => {
                video.pause();
            });

            customCtrls.querySelector(".load").addEventListener("click", () => {
                video.load();
            });
        },
        examMediaElementEvent() {
            const base = doc.getElementById("media-element-event");
            const video = base.querySelector(".sample-video");
            const output = base.querySelector(".output");
            const bq = selector => base.querySelector(selector);

            const eventTypeNames = [
                "play",
                "playing",
                // timeupdateは再生やシークで再生位置が変更された時に発生する。
                // ended発生後も発生させることができる。
                "timeupdate",
                "pause",
                // waiting, stalledはデータの遅延が発生した時のイベント。
                "waiting",
                "stalled",
                "ended",
                "error",
                // playが発生する前でもload()を呼ぶとabortが発生する。
                // endedが発生した後にload()を呼び出した場合でもabortが発生する。
                "abort"
            ];

            eventTypeNames.forEach(eventType => {
                video.addEventListener(eventType, evt => {
                    display({target: output, content: evt.type});
                });
            });

            bq(".clear").addEventListener("click", () => clear({target: output}));

            bq(".load").addEventListener("click", () => video.load());
        },
        examCanvasAndVideoCooperation() {
            /**
             * 参考:
             * https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Manipulating_video_using_canvas
             */
            class VideoPocessor {
                constructor({video, normalCanvas, customCanvas}) {
                    this.video = video;
                    this.normalContext = normalCanvas.getContext("2d");
                    this.customContext = customCanvas.getContext("2d");
                    this.drawFunc = () => this.draw();
                    this.video.addEventListener("timeupdate", this.drawFunc);
                }
                draw() {
                    if (!this.video.paused && !this.video.ended) {
                        this.computeFrame();
                    }
                }
                stopDrawing() {
                    this.video.removeEventListener("timeupdate", this.drawFunc);
                }
                // 引数の色に対し「chroma-keying effect」を適用するかどうかを
                // 判定するためのメソッド。
                // 閾値はハードコーディングされているが，これをパラメータ化すれば
                // 透過したい色を外部から指定できる。
                isTransparentPixel({r, g, b}) {
                    return r > 100 && g > 100 && b < 43;
                }
                computeFrame() {
                    const width = parseInt(this.video.width);
                    const height = parseInt(this.video.height);
                    this.normalContext.drawImage(this.video, 0, 0, width, height);
                    const frame = this.normalContext.getImageData(0, 0, width, height);
                    const dataLength = frame.data.length;
                    for (let index = 0; index < dataLength; index++) {
                        const r = frame.data[index * 4];
                        const g = frame.data[index * 4 + 1];
                        const b = frame.data[index * 4 + 2];
                        if (this.isTransparentPixel({r, g, b})) {
                            frame.data[index * 4 + 3] = 0;
                        }
                    }
                    this.customContext.putImageData(frame, 0, 0);
                }
            }
            
            const base = doc.getElementById("canvas-video-cooperation"),
                    bq = s => base.querySelector(s);
            
            const initVideoProcessor = () => {
                const video = bq(".sample-video"),
                    normalCanvas = bq(".normal-canvas"),
                    customCanvas = bq(".custom-canvas");
                const vp = new VideoPocessor({
                    video, normalCanvas, customCanvas
                });
                video.addEventListener("error", () => vp.stopDrawing());
            };

            initVideoProcessor();
        }
    };

    const init = () => {
        Object.keys(exams).forEach(key => exams[key]());
    };

    win.addEventListener("DOMContentLoaded", init);
})(window, document);
