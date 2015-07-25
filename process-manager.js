/**
 * 用于线性调用ajax，也可添加普通函数
 * 
 * @constructor
 */
function LinearProcessManager() {
	/**
	 * 管理器中的函数，顺序线性执行
	 * 
	 * @type {Array.<function>}
	 * @private
	 */
	this._processes = [];
}

LinearProcessManager.prototype = {
	constructor : LinearProcessManager,

	/**
	 * 添加函数，链式调用
	 * 
	 * @param {function}
	 *            process
	 * @param {Object}
	 *            param
	 * @return {this}
	 */
	add : function(process, param) {
		var params = Array.prototype.slice.call(arguments, 1, arguments.length);
		this._processes.push({
					process : process,
					param : params
				});

		return this;
	},

	/**
	 * 启动执行
	 * 
	 * @return {this}
	 */
	exec : function() {
		var _processes = this._processes, process;
		
		for (var i = 0, len = _processes.length; i < len; ++i) {
			_processes[i].param.push(_processes[i + 1]);
		}

		process = _processes.shift();

		process && process.process.apply(this, process.param);
		
		return this;
	}
};
