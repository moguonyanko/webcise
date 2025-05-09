/**
 * @fileOverview async.js
 * 
 * @description 
 * 読み込みを遅くし非同期読み込みの動作を確認するためのスクリプトです。
 * 
 */

(function(){
	
	var x = 10;
	
	function fib(n){
		if(n <= 1){
			return n;
		}else{
			return fib(n - 1) + fib(n - 2);
		}
	}
	
	console.log("async test ... fibonach result is " + fib(x) + " when x = " + x);
	
}());
