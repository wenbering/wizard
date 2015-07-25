/**
 * 配置计算资源step对应的handle
 * 
 * @module wizard.handlers.computeResource
 * 
 * @param {} userOptions
 * @return {Object} api
 */
wizard.handlers.computeResource = function(userOptions) {
	var model = wizard.model, self = this,

	options = wizard.utils.mixin({
				cpuDomId : 'cpuGroup',
				ramDomId : 'ramGroup',
				computeRes : {
					cpus : [{
								value : 1,
								mapRams : [0.5, 1, 2]
							}, {
								value : 2,
								mapRams : [2, 4, 8]
							}, {
								value : 4,
								mapRams : [4, 8, 16]
							}]
				},

				onCPUClick : null,
				onRAMClick : null,
				onValidate : null,
				getCustomWarningText : null
			}, userOptions),

	_$cpuDom, _$ramDom,

	_$cpuGroup = $('#' + options.cpuDomId), _$ramGroup = $('#'
			+ options.ramDomId);

	var renderCPUs = function() {

		var cpuDomArray = [];

		$.each(options.computeRes.cpus, function(i, val) {
					var label = val.value + ' ' + self.i18n.cpuUnit;

					cpuDomArray
							.push("<button type='button' class='btn' title='"
									+ label + "' data-count='" + val.value
									+ "'>" + label + "</button>");
				});

		_$cpuGroup.empty().append(_$cpuDom = $(cpuDomArray.join('')));
	},

	renderRAMs = function(cpu, p) {
		var $buttons = _$cpuGroup.find('button'), ramDomArray = [];

		ramDomArray.length = 0;
		$.each(options.computeRes.cpus[$buttons.index($(cpu))].mapRams,
				function(i, val) {
					var label = val + ' ' + self.i18n.ramUnit;

					ramDomArray.push("<button type='button' class='btn"
							+ (val === p ? " active" : "") + "' title='"
							+ label + "' data-count='" + val + "'>" + label
							+ "</button>");
				});

		_$ramGroup.empty().append(_$ramDom = $(ramDomArray.join('')));

		_$ramGroup.find('button.active').trigger('change', p);
	};

	_$cpuGroup.on('change click', 'button', function(e, p) {
				var cpuCoreCount = $(this).data('count');
				model.saveData('cpuCoreCount', cpuCoreCount);

				var feeHandler = this.getBaseModule('fee');
				if (feeHandler) {
					feeHandler.handleFee('CPU', parseFloat(cpuCoreCount));
					feeHandler.handleFee('MEMORY', 0);
				}

				var self = this;
				renderRAMs(self, p);

				options.onCPUClick && options.onCPUClick(cpuCoreCount);
			});

	_$ramGroup.on('change click', 'button', function(e, p) {
				var ramSize = $(this).data('count');

				model.saveData('ramSize', parseFloat(ramSize));

				var feeHandler = this.getBaseModule('fee');
				feeHandler && feeHandler.handleFee('MEMORY', ramSize);

				options.onRAMClick && options.onRAMClick(p);
			});

	_getValue = function() {
		return {
			cpu : _$cpuDom.filter('.active').data('count'),
			ram : _$ramDom.filter('.active').data('count')
		};
	};

	renderCPUs();

	return {
		/**
		 * 该步骤校验
		 */
		validate : function() {
			var valueObj = _getValue(), cpu = valueObj.cpu, ram = valueObj.ram;

			model.saveData({
						'cpuCoreCount' : cpu,
						'ramSize' : parseFloat(ram)
					});

			var validateFlag = !!(cpu && ram);

			return options.onValidate
					? (options.onValidate() && validateFlag)
					: validateFlag;
		},

		/**
		 * 选择CPU和内存
		 * @param {number} selectCPU
		 * @param {number} selectRAM
		 */
		select : function(selectCPU, selectRAM) {
			// TODO : look like a bug in ie8 when triggering click
			_$cpuDom.filter(function() {
						return $(this).data('count') == selectCPU
					}).addClass('active').trigger('change', selectRAM)
					.siblings().removeClass('active');
		},

		/**
		 * 取值
		 * @return {{cpu : number, ram : number}}
		 */
		getValue : _getValue,

		/**
		 * 警告信息
		 * @return {string}
		 */
		getWarningText : function() {
			return options.getCustomWarningText
					&& options.getCustomWarningText()
					|| self.i18n.configComputeResValidateInfo
		},

		setOptions : function(userOptions) {
			options = wizard.utils.mixin(options, userOptions);
		}
	}
};