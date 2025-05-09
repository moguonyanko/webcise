((win, doc, nav) => {
    "use strict";

    const samples = {
        coordinateProperty(geolocation) {
            const base = doc.querySelector("#coordinates-property"),
                    watching = base.querySelector(".watching"),
                    output = base.querySelector(".output");

            const options = {
                enableHighAccuracy: true,
                timeout: 3000,
                maximumAge: 0 // キャッシュは使わず常に最新の位置情報を得る。
            };

            let watchId;

            const startWatching = ({geolocation, options}) => {
                return new Promise((resolve, reject) => {
                    watchId = geolocation.watchPosition(resolve, reject, options);
                });
            };

            const stopWatching = ({geolocation, watchId}) => {
                geolocation.clearWatch(watchId);
            };

            const getCoordsProperties = coords => {
                const results = [
                    `経度:${coords.longitude}`,
                    `緯度:${coords.latitude}`,
                    `座標の精度:${coords.accuracy}`,
                    `標高(m):${coords.altitude}`,
                    `標高の精度:${coords.altitudeAccuracy}`,
                    `方位(北をゼロとして時計回り):${coords.heading}`,
                    `速度:${coords.speed}`
                ];
                return results;
            };

            const errorCodes = {
                1: "GPS利用権限なし", // PERMISSION_DENIED
                2: "内部エラー", // POSITION_UNAVAILABLE
                3: "タイムアウト" // TIMEOUT
            };

            watching.addEventListener("click", async () => {
                try {
                    if (watching.checked) {
                        const position = await startWatching({geolocation, options});
                        const properties = getCoordsProperties(position.coords);
                        output.innerHTML = properties.join("<br />");
                    } else {
                        stopWatching({geolocation, watchId});
                    }
                } catch (err) {
                    output.innerHTML = `${errorCodes[err.code]}(${err.message})`;
                }
            });
        }
    };

    const init = () => {
        const geolocation = nav.geolocation;
        Object.keys(samples).forEach(key => samples[key](geolocation));
    };

    win.addEventListener("DOMContentLoaded", init);
})(window, document, navigator);