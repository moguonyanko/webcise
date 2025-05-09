(function(win, doc) {

	var area = my.ref("WithResultArea"),
		nameInput = my.ref("WithSampleName");

	function getName() {
		return nameInput.value;
	}

	function Sample(name, id) {
		this.name = name;
		this.id = id;
	}

	Sample.prototype = {
		setName : function(name) {
			this.name = name;
		},
		getName : function() {
			return this.name;
		}
	};

	function setupObject(name) {
		var sample = new Sample("NONAME", 1);

		with (sample) {
			/**
			 * 引数のname変数ではなくオブジェクトに設定済みの
			 * nameプロパティが使われ続ける。 
			 */
			setName(name);
			/**
			 * 意図せずSampleのメソッドが呼び出されてしまう。 
			 * そのメソッドは変更されているかもしれない。
			 */
			my.log(getName());
		}

		return sample;
	}

	function changeSampleMethod() {
		/**
		 * setupObjectで呼び出しているつもりの無い
		 * メソッドを変更してしまう。
		 */
		Sample.prototype.getName = function() {
			return this.name + " CHANGED!!";
		};
	}

	(function init() {

		my.export("withNS", {
			displayName : function() {
				var sample = setupObject(getName());
				my.println(area, sample.getName(), true);
			},
			changeObject : function() {
				changeSampleMethod();
				my.log("Sample.prototype.getName is changed!");
			}
		});

	}());

}(window, document));