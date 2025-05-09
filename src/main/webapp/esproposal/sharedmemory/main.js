(((win, doc, g) => {
	"use strict";
	
	const getElements = baseClass => {
		const base = doc.querySelector("." + baseClass),
			runner = base.querySelector(".runner"),
			clearer = base.querySelector(".clearer"),
			result = base.querySelector(".result"),
			memory = base.querySelector(".memory");
			
		return { base, runner, clearer, result, memory };
	};
	
	const template = (baseClass, onClickListener) => {
		const { base, runner, clearer, result, memory } = getElements(baseClass);
		
		runner.addEventListener("click", () => {
			const size = parseInt(memory.value);
			if (!isNaN(size)) {
				onClickListener({ size, result });
			}
		});
		
		clearer.addEventListener("click", () => {
			result.innerHTML = "";
		});
	};
	
	const initExam1 = () => {
		template("example1", ({ size, result }) => {
			const buffer = new SharedArrayBuffer(size);
			const worker = new Worker("examworker1.js");
			const onmessage = evt => {
				const data = evt.data;
				result.innerHTML += `byte size = ${data.size} byte<br />`;
				worker.terminate();
			};
			worker.addEventListener("message", onmessage);
			worker.postMessage(buffer);
		});
	};
	
	const getExamIntArray = size => {
		const buffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * size);
		const intArray = new Int32Array(buffer);
		return intArray;
	};
	
	const initExam2 = () => {
		const baseClass = "example2";
		
		template(baseClass, ({ size, result }) => {
			/**
			 * TypedArrayを使う必要は無いがTypedArrayをWorkerに渡せることを
			 * 確認するために使っている。
			 */
			const intArray = getExamIntArray(size);
			intArray[0] = parseInt(doc.querySelector(`.${baseClass} .initial`).value);
			intArray[1] = parseInt(doc.querySelector(`.${baseClass} .limit`).value);
			intArray[2] = parseInt(doc.querySelector(`.${baseClass} .step`).value);
			
			const worker2 = new Worker("examworker2.js");
			const onmessage = evt => {
				const data = evt.data;
				result.innerHTML += `result value = ${data.value}<br />`;
				/* worker2_1の処理により値が変更されている「かもしれない」 */
				result.innerHTML += `modified initial value = ${data.source[0]}<br />`;
				worker2.terminate();
			};
			worker2.addEventListener("message", onmessage);
			
			/* Int32Arrayの要素を変更するWorker */
			const worker2_1 = new Worker("examworker2_1.js");
			worker2_1.postMessage(intArray);
			
			worker2.postMessage(intArray);
		});
	};
	
	const getWorkerPromise = ({ path, array }) => {
		const promise = new Promise((resolve, reject) => {
			const worker = new Worker(path);
			worker.onmessage = evt => {
				worker.terminate();
				resolve(evt.data.value);
			};
			worker.onerror = reject;
			worker.postMessage(array);
		});
		
		return promise;
	};
	
	/**
	 * @todo
	 * Atomicsの効果を感じられないサンプルになっている。
	 */
	const initExam3 = () => {
		const baseClass = "example3";
		
		template(baseClass, ({ size, result }) => {
			const array = getExamIntArray(size);
			
			/* 1からsize+1の値で配列を初期化 */
			array.forEach((v, i) => { array[i] = i + 1; });
			
			const subOneWorker = getWorkerPromise({
				path: "examworker3_1.js", array
			});
			const multiTenWorker = getWorkerPromise({
				path: "examworker3_2.js", array
			});
			
			Promise.all([subOneWorker, multiTenWorker]).then(resultsOfAllWorkers => {
				/**
				 * Promise.all使用時のthenの引数は全てのPromiseの結果を含む配列に
				 * なっている。
				 */
				const values = [...resultsOfAllWorkers[0], ...resultsOfAllWorkers[1]];
				/**
				 * Atomicsのメソッドの引数として渡す配列はSharedArrayBufferから成る
				 * TypedArrayでなければならない。（Shared typed array）
				 */
				const intArray = getExamIntArray(values.length);
				intArray.set(values);
				/**
				 * Atomics.loadを使っても使わなくても結果が変わらない。
				 */
				result.innerHTML += `${intArray.map((v, i) => Atomics.load(intArray, i))}<br />`;
				//result.innerHTML += `${intArray}<br />`;
			});
		});
	};
	
	const initExam4 = () => {
		const baseClass = "example4";
		
		template(baseClass, ({ size, result }) => {
			const array = getExamIntArray(size);
			
			/**
			 * メインスレッドに当たるスクリプトでAtomics.waitを呼び出すとエラーになる。
			 */
			result.innerHTML += `Initial: ${array}<br />`;
			
			const worker4_1 = getWorkerPromise({
				path: "examworker4_1.js", array
			});
			
			const worker4_2 = getWorkerPromise({
				path: "examworker4_2.js", array
			});
			
			Promise.all([worker4_1, worker4_2]).then(allResultValues => {
				allResultValues.forEach(resultValues => {
					result.innerHTML += `${resultValues}<br />`;
				});
			});
			
			/**
			 * このAtomics.storeが実行されないと各Workerの結果が返されない。
			 */
			Atomics.store(array, 0, 100);
			/**
			 * このサンプルではAtomics.wakeを呼んでも呼ばなくても結果は変わらない。
			 */
			Atomics.wake(array, 0, 1);
		});
	};
	
	const initExams = () => {
		initExam1();
		initExam2();
		initExam3();
		initExam4();
	};
	
	win.addEventListener("DOMContentLoaded", initExams);
})(window, document, goma));
