/**
 * carousel插件api适配
 * 
 * @module wizard.adapters.carousel
 * @param {Object} userOptions
 */
wizard.adapters.carousel = function(options) {

	var that = this, utils = wizard.utils, options = utils.mixin({
				container : '.viewport',
				validate : null,
				beforeMove : null,
				afterMove : null
			}, options),

	_$container = $(options.container),

	instance = _$container.tinycarousel();

	_$container.off('next').on('next', function(e, p) {
		_$container.tinycarousel({
					validate : utils.isFunction(options.validate) ? !!options
							.validate(e, p) : true
				});
	});

	utils.isFunction(options.beforeMove)
			&& _$container.off('beforemove').on('beforemove', function(e, p) {
						if (instance.isLast()) {
							wizard.pubSub.publish('enterLast');
						} else {
							wizard.pubSub.publish('leaveLast');
						}
						
						options.beforeMove(e, p);
					});

	_$container.off('move').on('move', function(e, p) {
				utils.isFunction(options.afterMove) && options.afterMove(e, p);
			});

	return {

		/**
		 * 移动到step
		 * @param {number} index 移动到索引为index的step
		 * @param {boolean} needTraversal 是否执行前面步骤的init begin end
		 * @param {boolean} nonAnimate 是否需要动画
		 */
		moveTo : function(index, needTraversal, nonAnimate) {
			var index = arguments[0];
			if (!arguments[1]) {
				instance.move(index, nonAnimate);
			} else {
				for (var i = 0; i <= index; ++i) {
					instance.move(i);
				}
			}
		},

		/**
		 * 返回实例
		 */
		getInstance : function() {
			return instance;
		},

		/**
		 * 移除step
		 * @param {number} index
		 */
		remove : function(index) {
			instance.getSlide(index).remove();
			instance.update();
		},

		/**
		 * 返回当前step
		 */
		getCurrentSlide : function() {
			return instance.getCurrentSlide();
		},

		/**
		 * 返回当前索引
		 */
		getIndex : function() {
			return instance.getIndex();
		},

		getSlide : function(i) {
			return instance.getSlide(i);
		}
	}
};
