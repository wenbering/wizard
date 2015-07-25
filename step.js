/**
 * step工厂
 * @module wizard.step
 * 
 * @param {{validate : function, init : function, begin : function, end : function, handle : function, i18n : Object}} 
 * 			参数为wizard.steps模块
 * 			模块结构为：{
 * 				id {string} 模块id,
 * 				init {function} 第一次进入该step时执行,
 * 				begin {function} 每次进入该step时执行,
 * 				end {function} 每次离开该step时执行,
 * 				handle {function} step被加入到wizard时自动执行，返回该step的api，供上面函数调用
 * 				i18n {Object} 国际化对象,
 * 				clear {function} 清除该步骤产生的数据
 * 			}
 * 			其中只有id为必需
 * 
 * @return {wizard.step}
 */
wizard.step = function(userOptions) {
	return new wizard.step.prototype._Init(userOptions);
}

/**
 * step索引
 * @static
 * @type Number
 */
wizard.step.index = 0;

wizard.step.prototype = {
	constructor : wizard.step,

	/**
	 * @constructor
	 * @private
	 * @param {} userOptions
	 */
	_Init : function(userOptions) {

		//step初始化标志
		var inited = false, utils = wizard.utils;

		/**
		 * inited getter
		 * @return {boolean}
		 */
		this.getInited = function() {
			return inited
		};

		/**
		 * inited setter true
		 * @return {boolean.1}
		 */
		this.inited = function() {
			return inited = true;
		};

		/**
		 * inited setter false
		 * @return {boolean.0}
		 */
		this.reset = function() {
			return inited = false;
		};

		/**
		 * 索引
		 * @type {number}
		 */
		this.index = wizard.step.index++;

		options = utils.mixin({
					validate : null,
					init : null,
					begin : null,
					end : null,
					handle : null,
					i18n : null
				}, userOptions);

		if (typeof options.id !== 'string' && utils.trim(options.id) === '') {
			throw new Error('Step instance should have an property named id.')
		}

		for (var i in options) {
			this[i] = options[i];
		}
	}
}

wizard.step.prototype._Init.prototype = wizard.step.prototype;
