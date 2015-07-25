/**
 * slider和input封装
 * 
 * @module wizard.adapters.slider
 * @param {Object} userOptions
 */
wizard.adapters.slider = function(userOptions) {

	var utils = wizard.utils,

	options = $.extend(true, {
				sliderId : '',
				inputId : '',
				rateCallback : null,
				sliderOptions : {
					range : "min",
					min : 0,
					value : 0,
					slide : function(event, ui) {
						$input.val(value = parseFloat(ui.value));
						options.rateCallback && options.rateCallback(value);
					},
					step : 1
				}
			}, userOptions),

	value, oldCallback,

	sliderOptions = options.sliderOptions,
	
	rateCallback = options.rateCallback,

	$slider = $('#' + options.sliderId), $input = $('#' + options.inputId),

	validateInput = function(val) {
		var min = sliderOptions.minMoveValue || sliderOptions.min, max = sliderOptions.maxMoveValue
				|| sliderOptions.max;

		if (isNaN(val) || (val + "").indexOf('.') >= 0
				|| (val + "").charAt(0) == '0') {
			$input.val(value = min);
		} else if (val < min) {
			$input.val(value = min);
		} else if (val > max) {
			$input.val(value = max);
		}

		// if (inputId == 'bandWidthValue' && (value % 10)) {
		$input.val(value = Math.round(value / sliderOptions.step)
				* sliderOptions.step);
		// }

		return value;
	},

	init = function() {
		$slider.slider(sliderOptions);

		$input.val(sliderOptions.value || sliderOptions.minMoveValue
				|| sliderOptions.min).trigger('change');
	};

	$input.off('keypress').on('keypress', function(e) {
				(e.keycode > 47 || e.keycode < 58) && $input.val(value);
			}).off('change').on('change', function() {
				$slider.slider('value', validateInput(value = $input.val()));

				rateCallback && rateCallback(value);
			});

	init();

	return {

		/**
		 * @return slider实例
		 */
		getSlider : function() {
			return $slider;
		},

		/**
		 * 禁用
		 * @param {boolean} bool
		 */
		disable : function(bool) {
			var $parent = $slider.parent();
			$parent.stop(false, true);
			$parent[bool ? 'slideUp' : 'slideDown']();

			rateCallback ? rateCallback(value) : oldCallback
					&& oldCallback(value);

			if (bool) {
				rateCallback && (oldCallback = rateCallback);
				rateCallback = null;
			} else {
				oldCallback && (rateCallback = oldCallback);
			}
		},

		/**
		 * 重置
		 * @param {number} value
		 */
		reset : function(value) {
			value && (sliderOptions.value = value);
			init();
		},

		/**
		 * 取值
		 * @return {number}
		 */
		getValue : function() {
			return $slider.slider('option', 'value');
		}
	}
};