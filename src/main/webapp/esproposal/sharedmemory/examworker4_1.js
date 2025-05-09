(((self) => {
	"use strict";
	
	self.onmessage = evt => {
		const array = evt.data;
		
		Atomics.wait(array, 0, 1);
		console.log(`examworker4_1: ${array}`);
		//Atomics.store(array, 0, 1);
		//Atomics.wake(array, 0, 1);
		
		self.postMessage({
			value: array
		});
	};
})(self));
