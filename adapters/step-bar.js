/**
 * stepbar插件api适配
 * 
 * @module wizard.adapters.stepBar
 * @param {Object} userOptions
 */
wizard.adapters.stepBar = function(userOptions) {

	var options = wizard.utils.mixin({
				container : '#stepBarContainer',
				stepTitles : []
			}, userOptions),

	init = function() {
		return $(options.container).stepbar({
					steps : options.stepTitles
				});
	},

	instance = init();

	return {
		/**
		 * @return {StepBar} stepbar实例
		 */
		getInstance : function() {
			return instance;
		},

		/**
		 * 动态增删改导航节点
		 * @param {} 
		 */
		splice : function() {
			if (arguments.length < 2) {
				throw new Error('stepBar.instance should have more than two parameters.');
			}

			var type = wizard.utils.type;
			if (type(arguments[0]) !== 'number'
					|| type(arguments[1]) !== 'number'
					|| (arguments[2] && type(arguments[2]) !== 'string')) {
				throw new Error('stepBar.instance : wrong type of parameters.');
			}

			Array.prototype.splice.apply(options.stepTitles, arguments);

			instance = init();
		}
	};
};

