(() => {
    "use strict";

    const {win, doc, loc, nav} = {
        win: window,
        doc: document,
        loc: location,
        nav: navigator
    };
    
    const loadVideoMetaData = async ({video, mediaStream}) => {
        return new Promise((resolve, reject) => {
            video.srcObject = mediaStream;
            video.onloadedmetadata = resolve;
            video.onerror = reject;
        });
    };
    
    class UserVideoPlayer {
        constructor({ video, infomation }) {
            this.video = video;
            this.infomation = infomation;
            this.metadataLoaded = false;
        }
        log(content) {
            this.infomation.innerHTML += `${content}<br />`;
        }
        get resolutionWidth() {
            return parseInt(this.video.width);
        }
        get resolutionHeight() {
            return parseInt(this.video.height);
        }
        async play({ width = this.resolutionWidth, height = this.resolutionHeight } = {}) {
            if (this.metadataLoaded) {
                this.video.play();
                return;
            }
            // Safariは解像度を指定するとエラーになる。Chromeは問題無い。
//            const videoConstraints = { 
//                width: {
//                    min: parseInt(width)
//                },
//                height: {
//                    min: parseInt(height)
//                }
//            };
            const constraints = {
                audio: true,
                //video: videoConstraints
                video: true
            };
            try {
                const mediaStream = await nav.mediaDevices.getUserMedia(constraints);
                this.metadataLoaded = Boolean(await loadVideoMetaData({
                    video: this.video, mediaStream
                }));
                this.log("Finished loading metadata");
                this.video.play();
            } catch (err) {
                this.log(err.message);
            }
        }
        pause() {
            // ブラウザのUIで指定するpauseとは異なる動作をする。
            this.video.pause();
        }
    }
    
    const samples = {
        getUserDataSample() {
            const base = doc.querySelector(".getuserdata-sample");
            const container = base.querySelector(".camera-container");
            const infomation = base.querySelector(".infomation");
            
            const getCameraSize = () => {
                const containerStyle = getComputedStyle(container);
                const width = parseInt(containerStyle.width),
                    height = parseInt(containerStyle.height);
                return { width, height };
            };
            
            const createVideo = () => {
                const myVideo = doc.createElement("video");
                Object.assign(myVideo, getCameraSize());
                return myVideo;
            };
            
            const player = new UserVideoPlayer({
                video: createVideo(), infomation
            });
            
            base.querySelector(".runner").addEventListener("click", async () => {
                await player.play();
                container.appendChild(player.video);
            });
            
            base.querySelector(".pauser").addEventListener("click", () => {
                player.pause();
            });
        }
    };
    
    const init = () => Object.keys(samples).forEach(name => samples[name]());

    win.addEventListener("DOMContentLoaded", init);
})();