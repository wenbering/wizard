/**
 * switch���api���䣬�ط�װ
 * 
 * @constructor
 * 
 * @module wizard.adapters.Switch
 * @param {string} container
 */
wizard.adapters.Switch = function(container) {

	var instance = $(container).bootstrapSwitch();

	/**
	 * @return {Swtich} switchʵ��
	 */
	this.getInstance = function() {
		return instance;
	};
};

wizard.providers.Switch.prototype = {
	constructor : wizard.providers.Switch,

	/**
	 * �����л�������
	 * @param {function} listener
	 */
	setListener : function(listener) {
		this.getInstance().on('switch-change', listener);
	},

	/**
	 * ����״̬
	 * @param {boolean} status
	 */
	setStatus : function(status) {
		this.getInstance().bootstrapSwitch('setState', !!status);
		this.trigger();
	},

	/**
	 * ����
	 * @param {boolean} status
	 */
	trigger : function(status) {
		this.getInstance().trigger('switch-change', {
					value : status
				});
	}
};