/**
 * carousel
 * 
 */

(function($) {
	var pluginName = "tinycarousel", defaults = {
		start : 0 // The starting slide
		,
		axis : "x" // vertical or horizontal scroller? ( x || y ).
		,
		buttons : true // show left and right navigation buttons.
		,
		bullets : false // is there a page number navigation present?
		,
		interval : false // move to another block on intervals.
		,
		intervalTime : 3000 // interval time in milliseconds.
		,
		animation : true // false is instant, true is animate.
		,
		animationTime : 400 // how fast must the animation move in ms?
		,
		infinite : false // infinite carousel.
		,
		validate : true
		// validate
	}, finalOptions, instance;

	function Plugin($container, options) {
		finalOptions = $.extend({}, defaults, options);
		// console.debug(finalOptions)
		this._defaults = defaults;
		this._name = pluginName;

		var self = this, $viewport = $container, $overview = $viewport
				.find(".overview:first"), $slides = 0, $next = $("#next"), $prev = $("#prev"), $bullets = $container
				.find(".bullet")

		, viewportSize = 0, contentStyle = {}, slidesVisible = 0, slideSize = 0, slideIndex = 0

		, isHorizontal = finalOptions.axis === 'x', sizeLabel = isHorizontal
				? "Width"
				: "Height", posiLabel = isHorizontal ? "left" : "top", intervalTimer = null;

		this.slideCurrent = 0;
		this.slidesTotal = 0;

		function initialize() {
			self.update();
			self.move(self.slideCurrent);

			setEvents();

			return self;
		}

		this.update = function() {
			// $overview.find(".mirrored").remove();

			$slides = $overview.children();
			viewportSize = $viewport[0]["offset" + sizeLabel];

			var innerViewportSize = $viewport[sizeLabel.toLowerCase()]();

			// TODO
			$slides.css(sizeLabel.toLowerCase(), innerViewportSize);

			slideSize = $slides.first()["outer" + sizeLabel](true);

			self.slidesTotal = $slides.filter(':visible').length;
			slideCurrent = self.slideCurrent || finalOptions.start || 0;
			slidesVisible = Math.ceil(viewportSize / slideSize);

			// $overview.append($slides.slice(0,
			// slidesVisible).clone().addClass("mirrored"));
			$overview.css(sizeLabel.toLowerCase(), slideSize
							* (self.slidesTotal));

			$overview.css(posiLabel, -(self.slideCurrent) * slideSize);
			$overview.stop();

			return self;
		};

		function setEvents() {
			if (finalOptions.buttons) {
				$prev.click(function() {
							self.move(--slideIndex);

							return false;
						});

				$next.click(function() {
							$container.trigger("next", slideIndex);
							self.move(++slideIndex);

							return false;
						});
			}

			$(window).resize(self.update);

			if (finalOptions.bullets) {
				$container.on("click", ".bullet", function() {
							self.move(slideIndex = +$(this).attr("data-slide"));

							return false;
						});
			}
		}

		this.start = function() {
			if (finalOptions.interval) {
				clearTimeout(intervalTimer);

				intervalTimer = setTimeout(function() {
							self.move(++slideIndex);

						}, finalOptions.intervalTime);
			}

			return self;
		};

		this.stop = function() {
			clearTimeout(intervalTimer);

			return self;
		};

		this.move = function(index, notAnimation) {
			$overview.stop(false, true);
			if (self.slideCurrent < index && !finalOptions.validate) {
				slideIndex--;
				return;
			}

			slideIndex = index;
			self.slideCurrent = slideIndex % self.slidesTotal;

			if (slideIndex < 0) {
				self.slideCurrent = slideIndex = self.slidesTotal - 1;
				$overview.css(posiLabel, -(self.slidesTotal) * slideSize);
			}

			if (slideIndex > self.slidesTotal) {
				self.slideCurrent = slideIndex = 1;
				$overview.css(posiLabel, 0);
			}

			contentStyle[posiLabel] = -slideIndex * slideSize;

			$container.trigger("beforemove", {
						i : self.slideCurrent,
						animate : true
					});

			$overview.animate(contentStyle, {
						queue : false,
						duration : !notAnimation ? (finalOptions.animation
								? finalOptions.animationTime
								: 0) : 0,
						always : function() {
							$container.trigger("move", self.slideCurrent);
						}
					});

			setButtons();
			self.start();

			return self;
		};

		function setButtons() {
			if (finalOptions.buttons && !finalOptions.infinite) {
				$prev.toggleClass("disable", self.slideCurrent <= 0);
				$next.toggleClass("disable",
						self.slideCurrent >= self.slidesTotal - slidesVisible);
			}

			if (finalOptions.bullets) {
				$bullets.removeClass("active");
				$($bullets[self.slideCurrent]).addClass("active");
			}
		}

		this.getIndex = function($slide) {
			return $slides.index($slide);
		}

		this.getCurrentSlide = function() {
			return $slides.eq(self.slideCurrent);
		}
		
		this.getSlide = function(i) {
			return $slides.eq(i);
		};
		
		this.isLast = function() {
			return $slides.length == self.slideCurrent + 1;
		}

		return initialize();
	}

	$.fn[pluginName] = function(options) {
		var container = this.get(0);
		if (!container) {
			return;
		}

		if (!$.data(container, "plugin_" + pluginName)) {
			$.data(container, "plugin_" + pluginName, instance = new Plugin(
							$(container), options));
		} else {
			$.extend(finalOptions, options);
		}

		return instance;
	};
})(jQuery);