/*
 * applyfee
 * 
 * @author wangwenbo
 */

(function($, window, undefined) {

	var pluginName = 'applyfee', instance, options, feeMap = {
		totalFee : '',
		items : {}
	};

	$.fn[pluginName] = function(userOptions) {
		var container = this.get(0);
		if (!container) {
			return;
		}

		if (!$.data(container, "plugin_" + pluginName)) {
			$.data(container, "plugin_" + pluginName, instance = new ApplyFee(
							$(container), userOptions));
		} else {
			$.extend(options, userOptions);
		}

		return instance;
	};

	$.fn.applyfee.defaults = {
		trigger : 'hover',
		fee : [],
		account : 1,
		locale : 'zh_CN',
		interval : this.locale == 'en_US' ? 'Day' : '天',
		i18n : i18n(this.locale)
	};

	function i18n(locale) {
		return locale != 'en_US' ? {
			sep : '：',
			unitPriceText : '单价',
			currencyUnit : '元',
			sumFeeText : '总费用',
			freeText : '免费',
			empty : '(空)'
		} : {
			sep : ': ',
			unitPriceText : 'Unit Price',
			currencyUnit : 'Yuan',
			sumFeeText : 'Total Price',
			freeText : 'Free',
			empty : '(Empty)'
		}
	}

	function ApplyFee($container, userOptions) {
		options = $.extend(true, {}, $.fn.applyfee.defaults, userOptions);
		options.i18n = i18n(options.locale);

		var isEmpty = true;

		var $feeContainer = $("\
				<div class='fee-icon' data-placement='bottom'>\
				</div><span>"
				+ options.i18n.sumFeeText
				+ options.i18n.sep
				+ "</span><span class='fee-text'></span><span class='fee-unit'>"
				+ "</span>\
			"),

		$feeText = $feeContainer.filter('.fee-text'), $feeUnit = $feeContainer
				.filter('.fee-unit'),

		$toolTip = $feeContainer.filter('.fee-icon'),

		itemSumFee = [],

		tooltipOptions = {
			trigger : options.trigger,
			title : '',
			html : 'true'
		},

		self = this;

		function init() {
			updateToolTipTitle();
			$container.append($feeContainer).addClass('fee-main');
		};

		function updateToolTipTitle() {
			var feeArray = options.fee, feeTextArray = ['<table class="fee-table">'], sep = options.i18n.sep, unitPriceText = options.i18n.unitPriceText, currencyUnit = options.i18n.currencyUnit, freeText = options.i18n.freeText, interval = options.interval, itemIndex, item, itemSum;

			itemSumFee.length = 0;
			for (itemIndex in feeArray) {
				item = feeArray[itemIndex];
				var isChargeable = item.isChargeable;
				itemSumFee.push({
							sum : itemSum = parseFloat(item.rate)
									* parseFloat(item.num * options.account),
							isChargeable : isChargeable,
							unit : isChargeable
									? item.unit + '/' + interval
									: ''
						});

				if (isChargeable) {
					feeTextArray.push('<tr><td>' + item.name + sep
							+ toDecimal(itemSum) + ' ' + currencyUnit + '/'
							+ interval + '</td><td class="rightTd">'
							+ unitPriceText + sep + toDecimal(item.rate)
							+ currencyUnit + '/' + item.unit + '/' + interval);

					feeMap.items[item.name] = item.name + sep
							+ toDecimal(itemSum) + ' ' + currencyUnit + '/'
							+ interval;
				} else {
					feeTextArray.push('<tr><td>' + item.name + sep + freeText
							+ '</td><td class="rightTd">' + unitPriceText + sep
							+ freeText);
				}
			}

			if (isEmpty) {
				// feeTextArray.push('<tr><td style="padding:0 5px 0 5px">' +
				// options.i18n.empty + '</td></tr>');
			} else {
				feeTextArray.push('</table>');

				$toolTip.tooltip(tooltipOptions);
				$toolTip.attr('data-original-title', feeTextArray.join(''));
				$toolTip.tooltip('fixTitle');
			}

			showSumFee();
		}

		function showSumFee() {
			var sum = 0, sumFeeText = '', freeText = options.i18n.freeText, unit = options.i18n.currencyUnit
					+ '/' + options.interval, isFree = true;

			for (var i in itemSumFee) {
				var sumObj = itemSumFee[i];
				if (isFree && !sumObj.isChargeable) {
					sumFeeText = freeText;
					unit = sumObj.unit;
				} else {
					isFree = false;
					sum += isNaN(itemSumFee[i].sum) ? 0 : itemSumFee[i].sum;
					// unit = sumObj.unit;
				}
			}

			sumFeeText != freeText && (sumFeeText = (toDecimal(sum) + ' '));
			$feeText.text(sumFeeText);
			$feeUnit.text(unit);

			feeMap.totalFee = sumFeeText + unit;
		}

		function toDecimal(num, decimal) {
			var decimal = decimal | 100;
			return Math.round(num * 100) / 100;
		}

		this.setFee = function(fee) {
			fee && fee.length > 0 && (isEmpty = false);

			itemSumFee.length = 0;
			options.fee.length = 0;
			options.fee = fee;
			updateToolTipTitle();
		}

		this.addFee = function(fee) {
			var primaryFee = options.fee, flag = false;

			fee != null && (isEmpty = false);

			// outer : for (var i in fee) {
			for (var j in primaryFee) {
				if (primaryFee[j].name == fee.name) {
					primaryFee[j] = $.extend({}, fee);
					flag = true;
					break;
				}
			}
			// }

			!flag && primaryFee.push(fee);

			updateToolTipTitle();
		}

		this.update = function(userOptions) {
			$.extend(options, userOptions);
			init();
		}

		this.setSumFee = function(sumFee) {
			itemSumFee.length = 0;

			itemSumFee.push({
						sum : sumFee,
						isChargeable : true,
						unit : ''
					});

			$toolTip.tooltip('destroy');
			showSumFee();
		}

		this.getTotalFeeString = function() {
			if (feeMap.totalFee === options.i18n.freeText) {
				return feeMap.totalFee;
			} else {
				var items = [];
				for (var i in feeMap.items) {
					items.push(feeMap.items[i]);
				}

				return feeMap.totalFee
						+ (items.length ? ' ( ' + items.join(', ') + ' )' : '');
			}
		}

		return init();
	};

})(jQuery, window);