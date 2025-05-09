(((self) => {
	"use strict";
	
	self.onmessage = evt => {
		var data = evt.data;
		self.postMessage({
			size: data.byteLength
		});
	};
})(self));
