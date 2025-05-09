((window, document) => {
    "use strict";

    const existsNortification = "Notification" in window;

    const requireNortification = () => {
        if (!existsNortification) {
            throw new Error("Not supported Nortifications API");
        }
    };

    const existsServiceWorker = "serviceWorker" in window.navigator;

    /**
     * ブラウザごとに通知ダイアログが閉じられるまでの時間は異なる。
     * これを統一するためには自分で時間を指定してcloseを呼び出す。
     */
    const closeNortification = (nortification, time = 5000) => {
        setTimeout(() => nortification.close(), time);
    };

    const getNortificationArgs = (name = "no name") => {
        const title = `こんにちは ${name}`;
        const options = {
            tag: "サンプル通知",
            body: "よろしくお願いします",
            icon: "../../favicon.ico"
        };
        return {title, options};
    };

    /**
     * Notificationインスタンスを生成すると通知が即実行される。
     * 表示される通知ダイアログの外観はブラウザによって異なる。
     * bodyやiconといったオプションへの対応状況もブラウザごとに異なる。
     * HTTPSでなくても通知は行える。
     */
    const createNortification = () => {
        const args = getNortificationArgs("no sw user");
        const nortification = new Notification(args.title, args.options);
        closeNortification(nortification);
    };

    /**
     * モバイルデバイスではServiceWorker経由でないと通知に失敗する。
     */
    const noticeBySW = async () => {
        console.log("ServiceWorkerで通知リトライ");
        try {
            const registration = await navigator.serviceWorker.register("sw.js");
            const args = getNortificationArgs("sw user");
            registration.showNortifications(args.title, args.options);
        } catch (err) {
            alert(err.message);
        }
    };

    const samples = {
        simpleNotificationSample() {
            const base = document.querySelector(".simple-notification-sample"),
                    runner = base.querySelector(".runner"),
                    clearer = base.querySelector(".clearer"),
                    resultArea = base.querySelector(".result-area");

            runner.addEventListener("click", async () => {
                try {
                    requireNortification();
                    const result = await Notification.requestPermission();
                    resultArea.innerHTML += `${result}<br />`;
                    createNortification();
                } catch (err) {
                    if (existsServiceWorker) {
                        await noticeBySW();
                    } else {
                        alert(err.message);
                    }
                }
            });

            clearer.addEventListener("click", () => resultArea.innerHTML = "");
        }
    };

    const init = () => {
        Object.keys(samples).forEach(sampleName => samples[sampleName]());
    };

    window.addEventListener("DOMContentLoaded", init);
})(window, document);
