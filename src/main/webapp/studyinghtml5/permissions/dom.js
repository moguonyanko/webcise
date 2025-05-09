import pm from "./permissions.js";

const logError = err => console.error(err);

const logInfo = info => console.info(info);

const getPosition = options => {
    return new Promise((resolve, reject) => {
        const descriptor = {
            name: "geolocation"
        };
        new pm.PermittedExecutor({
            descriptor,
            onPermitted: status => {
                logInfo(status);
                navigator.geolocation.getCurrentPosition(resolve, reject, options);
            },
            onDenied: reject,
            onChange: logInfo
        }).execute();
    });
};

const addListener = () => {
    const base = document.querySelector(".permissions-geolocation-example");
    const resultArea = base.querySelector(".result");
    const timeoutEle = base.querySelector(".timeout");
    base.addEventListener("click", async event => {
        if (event.target.classList.contains("positiongetter")) {
            event.stopPropagation();
            const options = {
                enableHighAccuracy: false,
                timeout: parseInt(timeoutEle.value),
                maximumAge: 1000 * 60 * 60 * 24
            };
            try {
                const position = await getPosition(options);
                const {longitude, latitude} = position.coords;
                resultArea.value += `${longitude},${latitude}\n`;
            } catch (err) {
                resultArea.value += `${err.message}\n`;
            }
        }
    });
};

const main = async () => {
    //await pm.test.runTest();
    addListener();
};

window.addEventListener("DOMContentLoaded", main);
window.addEventListener("unhandledrejection", logError);
