import abCtrl from "./abortcontroller.js";

const displayJSON = ({fetchTarget, fetching, resultArea, timeout}) => {
    setTimeout(async () => {
        const json = await fetching.doFetch(fetchTarget);
        resultArea.innerHTML += `${JSON.stringify(json)}<br/>`;
    }, timeout);
};

const abortJSONRequest = async ({fetchTarget, fetching, resultArea}) => {
    try {
        // setTimeoutで待機中のfetchに割り込んでabortを行うことができない。
        await fetching.doAbort(fetchTarget);
    } catch (err) {
        resultArea.innerHTML += `${err.message}<br />`;
    }
};

const toms = value => parseInt(value) * 1000;

const eventListeners = {
    example1: () => {
        const base = document.querySelector(".example1");
        const resultArea = base.querySelector(".result");
        const target = base.querySelector(".control");
        const url = "sample.json";
        const fetchTarget = new abCtrl.FetchTarget({
            url,
            type: "json"
        });
        const fetching = new abCtrl.Fetching({
            targets: [fetchTarget],
            onAborted: obj => {
                console.info(obj);
                resultArea.innerHTML += `Aborted: ${obj.target.url}<br/>`;
            }
        });
        target.addEventListener("click", async event => {
            if (event.target.classList.contains("subject")) {
                event.stopPropagation();
                if (event.target.classList.contains("download")) {
                    const timeEle = base.querySelector(".timeout");
                    let timeout = toms(timeEle.value || 0);
                    if (timeout > toms(timeEle.max)) {
                        timeout = toms(timeEle.max);
                    }
                    displayJSON({fetchTarget, fetching, resultArea, timeout});
                } else if (event.target.classList.contains("abort")) {
                    await abortJSONRequest({fetchTarget, fetching, resultArea});
                } else if(event.target.classList.contains("clear")) {
                    resultArea.innerHTML = "";
                }
            }
        });
    }
};

const main = async () => {
    await abCtrl.test.runTest();
    Object.values(eventListeners).forEach(f => f());
};

window.addEventListener("DOMContentLoaded", main);
window.addEventListener("unhandledrejection", e => console.error(e));
