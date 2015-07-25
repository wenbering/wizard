/**
 * switch²å¼şapiÊÊÅä£¬ÖØ·â×°
 * 
 * @constructor
 * 
 * @module wizard.adapters.Switch
 * @param {string} container
 */
wizard.adapters.Switch = function(container) {

	var instance = $(container).bootstrapSwitch();

	/**
	 * @return {Swtich} switchÊµÀı
	 */
	this.getInstance = function() {
		return instance;
	};
};

wizard.providers.Switch.prototype = {
	constructor : wizard.providers.Switch,

	/**
	 * ÉèÖÃÇĞ»»¼àÌıÆ÷
	 * @param {function} listener
	 */
	setListener : function(listener) {
		this.getInstance().on('switch-change', listener);
	},

	/**
	 * ÉèÖÃ×´Ì¬
	 * @param {boolean} status
	 */
	setStatus : function(status) {
		this.getInstance().bootstrapSwitch('setState', !!status);
		this.trigger();
	},

	/**
	 * ´¥·¢
	 * @param {boolean} status
	 */
	trigger : function(status) {
		this.getInstance().trigger('switch-change', {
					value : status
				});
	}
};