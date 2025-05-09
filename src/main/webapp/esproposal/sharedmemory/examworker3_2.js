(((self) => {
	"use strict";
	
	self.onmessage = evt => {
		const array = evt.data;
		
		array.forEach((v, i) => {
			//array[i] *= 2;
			Atomics.store(array, i, v * 2);
		});
		
		self.postMessage({
			value: array
		});
	};
})(self));
