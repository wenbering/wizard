/*
 * stepbar
 * 
 * @author wangwenbo
 */

(function($, window, undefined) {

	var pluginName = 'stepbar', instance, options;

	$.fn[pluginName] = function(userOptions) {
		var container = this.get(0);
		if (!container) {
			return;
		}

		if (!$.data(container, "plugin_" + pluginName)) {
			$.data(container, "plugin_" + pluginName, instance = new StepBar(
							$(container), userOptions));
		} else {
			$.extend(options, userOptions);
			instance.init();
		}

		return instance;
	};

	$.fn.stepbar.defaults = {
		steps : [],
		stepIndex : 0
	};

	function StepBar($container, userOptions) {
		options = $.extend({}, $.fn.stepbar.defaults, userOptions);

		var $ul = $("<ul class='step-bar'></ul>"),

		$li = $("\
				<li>\
					<div class='icon'>\
					</div>\
					<div class='line'>\
					</div>\
					<span></span>\
				</li>"),

		stepStatus = ['nostart', 'active', 'done'],

		$lis,

		currentStep,

		self = this;

		this.init = function() {
			currentStep = -1;
			$container.empty();
			$lis = null;
			$ul.empty();

			var steps = options.steps, stepLength = steps.length, stepIndex, stepName, $liClone;

			if (!stepLength) {
				return $ul;
			}

			for (stepIndex in steps) {
				stepName = steps[stepIndex];
				$liClone = $li.clone().appendTo($ul);
				$liClone.find('span').text(stepName);
				$ul.appendTo($container);
			}

			$lis = $ul.find('li');
			$lis.last().find('.line').remove();

			setStyle();

			resetStepStatus();

			self.stepTo(0);

			currentStep = 0;
		};

		function setStyle() {
			var liNum = $lis.length, minusWidth = 0, ulMarginLeft = 0;

			$lis.first().css('margin-left', 0);

			$lis.find('span').each(function(i) {
				var $this = $(this), marginLeft = -Math
						.ceil(($this.width() - 16) / 2);

				$this
						.css('margin-left', marginLeft > 0 ? 0 : marginLeft
										+ 'px');

				if (0 == i) {
					ulMarginLeft = -marginLeft;
				}

				if (liNum - 1 == i) {
					minusWidth = -marginLeft;
				}
			})

			$ul.width($ul.width() - ulMarginLeft).css('margin-left',
					ulMarginLeft);

			$lis.find('.line').width(Math.floor((($ul.width() - (liNum - 1) * 5
					- liNum * 16 - minusWidth) / ($lis.length - 1))));
		}

		function resetStepStatus() {
			changeStepStyle($ul.find('li'), stepStatus[0]);
		}

		this.stepTo = function(stepIndex) {
			if (currentStep == stepIndex)
				return;

			currentStep = stepIndex = stepIndex < 0
					? 0
					: (stepIndex >= $lis.length) ? $lis.length - 1 : stepIndex;

			var $activeStep = $lis.eq(stepIndex);
			changeStepStyle($activeStep.prevAll(), stepStatus[2]);
			changeStepStyle($activeStep, stepStatus[1]);
			changeStepStyle($activeStep.nextAll(), stepStatus[0]);
		};

		this.nextStep = function() {
			self.stepTo(currentStep + 1);
		};

		this.preStep = function() {
			self.stepTo(currentStep - 1);
		};

		this.getCurrentStep = function() {
			return currentStep;
		};

		function changeStepStyle($li, status) {
			if (!$li.length)
				return;

			var $line = $li.find('.line'), $icon = $li.find('.icon');

			for (var i in stepStatus) {
				var stepstatus = stepStatus[i];
				if (status == stepstatus)
					continue;

				$li.removeClass('li-' + stepstatus);
				$icon.removeClass('icon-' + stepstatus);
				$line.removeClass('line-' + stepstatus);
			}

			$li.addClass('li-' + status);
			$icon.addClass('icon-' + status);
			$line.addClass('line-' + status);
		};

		return this.init();
	};

})(jQuery, window);