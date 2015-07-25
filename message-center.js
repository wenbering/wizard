/**
 * 订阅类
 * @constructor
 * 
 * @param {function} callback 回调
 * @param {function} dispose 销毁回调
 * @param {} stepId
 */
wizard.Subscription = function(callback, dispose, stepId) {
	this.stepId = stepId;
	this.isDisposed = false;

	this.dispose = function() {
		this.isDisposed = true;
		dispose && dispose();
	}

	this.callback = callback;
};

/**
 * 消息中心
 * @module wizard.pubSub
 */
wizard.pubSub = (function() {
	var _subscribers = {};

	return {
		/**
		 * 订阅
		 * @param {string} subject
		 * @param {string} stepId 用于在step移除后销毁其对事件的订阅
		 * @param {function} callback 
		 */
		subscribe : function(subject, stepId, callback) {
			if (!wizard.utils.isFunction(callback))
				return false;

			!_subscribers[subject] && (_subscribers[subject] = []);

			_subscribers[subject].push(new wizard.Subscription(callback,
					function() {

					}, stepId));

			return true;
		},

		/**
		 * 取消订阅，step移除时清除订阅
		 * @param {string} stepId
		 */
		unSubscribe : function(stepId) {
			for (var key in _subscribers) {
				wizard.utils.objectArrayRemoveItemByProperty(_subscribers[key],
						'stepId', stepId);
			}
		},

		/**
		 * 发布
		 * @param {string} subject
		 * @param {} params
		 */
		publish : function(subject, params) {
			if (!_subscribers[subject]) return;
			
			wizard.utils.arrayForEach(_subscribers[subject].slice(), function(subscription) {
				if (subscription && (subscription.isDisposed !== true) && subscription.callback) {
					subscription.callback.call(null, params);
				}
			})
		}
	}
}());