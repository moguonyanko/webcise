(((self) => {
	"use strict";
	
	self.onmessage = evt => {
		const intArray = evt.data;
		
		/**
		 * SharedArrayBufferから生成されたInt32Arrayの要素を変更するテスト。
		 * 文字列を代入するとゼロにされる。NaNにはならない。
		 * メモリが別のWorkerと共有されているため，このような変更を行うと
		 * 別のWorkerにおけるSharedArrayBufferを使った処理で意図しない結果が
		 * 生まれる可能性がある。
		 */
		intArray[0] = -100;
				
		self.postMessage({
			source: intArray
		});
	};
})(this));
