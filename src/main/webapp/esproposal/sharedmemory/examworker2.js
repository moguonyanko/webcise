(((self) => {
	"use strict";
	
	class Incrementer {
		constructor(intArray) {
			this.initial = intArray[0];
			this.limit = intArray[1];
			this.step = intArray[2];
		}
		
		*iterator() {
			for (let value = this.initial; value < this.limit; value += this.step) {
				yield value;
			}
		}
	}
	
	self.onmessage = evt => {
		const intArray = evt.data;
		const incrementer = new Incrementer(intArray);
		
		let resultValue = null;
		let iter = incrementer.iterator();
		for (let value of iter) {
			resultValue = value;
		}
				
		self.postMessage({
			value: resultValue,
			source: intArray
		});
	};
})(this));
