((win, doc) => {
    "use strict";
    
    const samples = {
        EndianSample() {
            const getTypedArray = ({ size = 0, offset = 0, value = 0, 
                littleEndian = false } = {}) => {
                const buffer = new ArrayBuffer(size);
                new DataView(buffer).setInt32(offset, value, littleEndian);
                const array = new Int32Array(buffer);
                return array;
            };

            const select = selector => doc.querySelector(".endian-sample " + selector);
            const display = (target, content) => target.innerHTML += content + "<br />"; 
            const clear = target => target.innerHTML = "";
            
            const getArrayBufferSize = () => {
                return select(".buffer-size").value;
            };

            const getDataViewOffset = () => {
                return select(".dataview-offset").value;
            };

            const getDataViewValue = () => {
                return select(".dataview-value").value;
            };

            const isLittleEndian = () => {
                return select(".endian").checked;
            };

            const addListener = () => {
                const runner = select(".runner");
                const clearer = select(".clearer");
                const result = select(".result");

                runner.addEventListener("click", () => {
                    const size = getArrayBufferSize(), 
                        offset = getDataViewOffset(),
                        value = getDataViewValue(),
                        littleEndian = isLittleEndian();
                    const array = getTypedArray({ size, offset, value, littleEndian });
                    display(result, array.toString());            
                });

                clearer.addEventListener("click", () => clear(result));
            };
            
            addListener();
        },
        async ImageDataSample() {
            const createImageData = ({ arrayBuffer, width = 0, height = 0 } = {}) => {
                if (!arrayBuffer) {
                    throw new Error("Source ArrayBuffer is nothing");
                }
                const typedArray = new Uint8ClampedArray(arrayBuffer);
                // TODO:TypedArrayのサイズが足りなくてエラーが発生する。
                return new ImageData(typedArray, width, height);
            };
            
            const select = selector => doc.querySelector(".imagedata-sample " + selector);
            const canvas = select("canvas"),
                width = parseInt(canvas.width), 
                height = parseInt(canvas.height);
            const context = canvas.getContext("2d");
            
            const readImageData = async () => {
               const response = await fetch("thunder.png");
               if (!response.ok) {
                   throw new Error(`Cannot read image: ${response.statusText}`);
               }
               const arrayBuffer = await response.arrayBuffer();
               return createImageData({ arrayBuffer, width, height });
            };
            
            const readImageBlob = async url => {
               const response = await fetch(url);
               if (!response.ok) {
                   throw new Error(`Cannot read image: ${response.statusText}`);
               }
               return await response.blob();
            };
            
            const drawImage = async imageData => {
                const bitmap = await createImageBitmap(imageData);
                // ImageDataを直接drawImageすることはできない。
                context.drawImage(bitmap, 0, 0);
            };
            
            const drawRandomDots = () => {
                const imageData = context.getImageData(0, 0, width, height);
                const data = imageData.data;
                for (let index = 0; index < data.length; index += 4) {
                    data[index] = Math.random() * 255;
                    data[index + 1] = Math.random() * 255;
                    data[index + 2] = Math.random() * 255;
                }
                context.putImageData(imageData, 0, 0);
            };
            
            const getInvertImageData = () => {
                // context.createImageDataを介すると変更を反映できない。
                // const imageData = context.createImageData(context.getImageData(0, 0, width, height));
                const imageData = context.getImageData(0, 0, width, height);
                const data = imageData.data;
                // 画像の反転処理
                for (let index = 0; index < data.length; index += 4) {
                    data[index] = 255 - data[index];
                    data[index + 1] = 255 - data[index+ 1];
                    data[index + 2] = 255 - data[index + 2];
                }
                // 戻り値のImageDataはcontext.putImageDataを使わなくてもcontext.drawImageで描画することで
                // 現在のcanvasに反映することが可能である。
                return imageData;
            };
            
            // ブラウザキャッシュが効かないので呼び出す度にcanvasが明滅する。
            const drawInitialImageByBlob = async () => {
                const image = new Image();
                const blob = await readImageBlob("thunder.png");
                const blobURL = URL.createObjectURL(blob);
                image.onload = () => {
                    context.drawImage(image, 0, 0, width, height);
                    URL.revokeObjectURL(blobURL);
                };
                image.src = blobURL;
            };
            
            // async/awaitで使用したい関数はPromiseを返す。
            const createInitialImagePromise = () => {
                const promise = new Promise((resolve, reject) => {
                    const image = new Image();
                    image.onload = () => {
                        context.drawImage(image, 0, 0, width, height);
                        resolve(this);
                    };
                    image.onerror = err => {
                        reject(err);
                    };
                    image.src = "thunder.png";
                });
                return promise;
            };
            
            let intervalId;
            
            const setRandomAnimation = () => {
                context.rect(0, 0, width, height);
                context.fill();
                intervalId = setInterval(drawRandomDots, 1000);
            };
            
            const initCanvas = async () => { 
                await createInitialImagePromise();
                clearInterval(intervalId);
            };
            
            const addListener = () => {
                const runner = select(".runner"), 
                    clearer = select(".clearer"),
                    randomer = select(".randomer");
                
                runner.addEventListener("click", async () => {
                    try {
                        //const imageData = await readImageData();
                        const imageData = getInvertImageData();
                        await drawImage(imageData);
                    } catch(err) {
                        console.error(err);
                    }
                });
                
                clearer.addEventListener("click", async () => {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    await initCanvas();
                });
                
                randomer.addEventListener("click", setRandomAnimation);
            };
            
            await initCanvas();
            addListener();
        }
    };
    
    const init = () => Object.values(samples).forEach(sample => sample());
    
    win.addEventListener("DOMContentLoaded", init);
})(window, document);
