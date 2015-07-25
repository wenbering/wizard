/**
 * Button Group
 * 
 * @module wizard.handlers.buttonGroup
 * 
 * @param {} userOptions
 * @return {Object} api
 */
wizard.handlers.buttonGroup = function(userOptions) {
	var options = wizard.utils.mixin({
				stepId : '',
				container : '',
				loadDataURL : '',
				dsName : '',
				selectedEventName : '',
				ajaxDoneEventName : '',
				isDisabled : false,
				dataValidate : function() {
					return true;
				},
				afterRendered : null,
				click : null,
				prompt : {
					noResource : '',
					resourceHasBeenDeleted : ''
				}
			}, userOptions),

	$buttonGroup = $('#' + options.container), isLoaded = false, $buttons,

	// _optimisticLockHandler = new wizard.utils.optimisticLockProvider();

	//构造button group
	render = function() {
		$buttonGroup.empty();

		var ds = dataCenter.getDataStore(options.dsName);
		if (!ds)
			return;

		var data = ds.getRowSet().getData(), domArray = [];

		if (data == null)
			return;

		$.each(data, function(i, val) {
					domArray.push("<button type='button' class='btn"
							// + (options.isDisabled ? " disabled" : "")
							+ "' title='" + val.name + "'data-id='"
							+ (options.getId ? options.getId(val) : val.id)
							+ "'>" + BC.escapeBracketSymbol(val.name)
							+ "</button>");
				});

		$buttons = $(domArray.join('')).appendTo($buttonGroup);

		wizard.utils.adjustBtnGroupLayout({
					$parent : $buttonGroup,
					$buttons : $buttons
				});
	},

	_select = function(para, type) {
		if (type == 'index') {
			if ($buttons.length <= para) {
				wizard.utils.dialog().show('warn', i18n.noResource);
			} else {
				$buttons.eq(para).trigger('click');
			}
		} else if (type == 'id') {
			var $button = $buttons.filter(function() {
						return $(this).data('id') == para;
					});

			if ($button && $button.length == 1) {
				$button.addClass('active').trigger('click');
			} else {
				wizard.utils.dialog().show('warn',
						options.prompt.resourceHasBeenDeleted);
			}
		}
	},

	_disable = function(bool) {
		if (bool !== undefined) {
			options.isDisabled = bool;
			$buttonGroup.find('button').not('.active')[bool === true
					? 'addClass'
					: 'removeClass']('disabled');
		} else {
			return options.isDisabled;
		}
	};

	$buttonGroup.on('click', 'button', function(e) {
				if (options.click) {
					var result = options.click
							.apply(this, [
											e,
											$buttonGroup.find('button')
													.index($(this))]);
					if (result === false) {
						return result;
					} else {
						_disable() && _disable(true);
					}
				}
			});

	return {

		/**
		 * 加载数据
		 */
		loadData : function(next) {
			var that = this;
			var loadCallback = function(dc) {
				try {
					wizard.model.updateDataCenter(dc);

					wizard.pubSub
							.publish('ajaxdone', options.ajaxDoneEventName);

					isLoaded = true;

					render();

					options.afterRendered && options.afterRendered.apply(that);

					next && next.process.apply(this, next.param);
				} catch (e) {
				}
			};

			BC.ajax(options.loadDataURL, options.getLoadDataParams
							&& options.getLoadDataParams() || {}, loadCallback);
		},

		/**
		 * 校验
		 */
		validate : function() {
			return !!options.dataValidate()
					&& this.isLoaded()
					&& (!options.isDisabled
							&& $buttonGroup.find('button').filter(function() {
										return $(this).hasClass('active')
									}).length || options.isDisabled);
		},

		/**
		 * 是否加载完成
		 * @return {boolean}
		 */
		isLoaded : function() {
			return isLoaded;
		},

		/**
		 * 是否仅有一项，可能需要隐藏该step
		 * @return {boolean}
		 */
		isSingleButton : function() {
			return $buttonGroup.find('button').length == 1;
		},

		/**
		 * 选择
		 * @param {} p 参数
		 * @param {string} type 选择类型
		 */
		select : function(p, type, next) {
			type = type || 'index';
			_select(p, type);

			next && next.process.apply(this, next.param);
		},

		/**
		 * 禁用
		 * @param {boolean}
		 */
		disable : _disable
	}
};