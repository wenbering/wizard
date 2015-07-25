/**
 * 计费api适配
 * 
 * @module wizard.adapters.fee
 * @param {Object} userOptions
 */
wizard.adapters.fee = function(userOptions) {

	var self = this, model = wizard.model, options = {
		container : '#fee',
		dsName : 'rateDS',

		getRelevanceIdFunc : function() {
			return model.getData('domainId');
		},

		resourceAndCountMap : {
			cpu : model.getData('cpuCoreCount'),
			memory : model.getData('ramSize'),
			storage : model.getData('dataDiskSize')
		},

		getCountFunc : function() {
			return model.getData('applyCount');
		},

		i18n : {}
	};

	options = wizard.utils.mixin(true, options, userOptions);

	var $fee = $(container), _instance,

	_handleFeeforUser = function(rate, num) {
	},

	_handleFeeforAdmin = function(rate, num) {
		_instance.addFee({
					name : options.i18n[rate.resType],
					rate : rate.ruleRate,
					num : num,
					unit : rate.resUnit,
					isChargeable : !!rate.resUnit
				});
	};

	_instance = $fee.applyfee({
				locale : locale
			});

	return {

		/**
		 * 计费对象实例
		 * @return {Fee}
		 */
		getInstance : function() {
			return _instance;
		},

		/**
		 * 计费jquery对象
		 * @return {jQuery}
		 */
		getDom : function() {
			return $fee;
		},
		
		/**
		 * 获取费率
		 * @param {string} resType 资源类型
		 * @return {Object}
		 */
		getRate : function(resType) {
			var ratesDS = dataCenter.getDataStore(options.getRelevanceIdFunc()
					+ options.dsName);
			if (!ratesDS)
				return;

			var rates = ratesDS.getRowSet().getData();
			for (var i in rates) {
				if (rates[i].resType == resType) {
					return rates[i];
				}
			}
		},

		/**
		 * 更新计费资源数量
		 * @param {number} val 数量
		 */
		updateCount : function(val) {
			_instance.update({
						account : val
					});
		},

		/**
		 * 进行计费
		 * @param {string} resType 资源类型
		 * @param {number} num 资源数量
		 */
		handleFee : function(resType, num) {
			var rate = this.getRate(resType);
			if (!rate)
				return;

			model.getData('isAdmin')
					? _handleFeeforAdmin(rate, num)
					: _handleFeeforUser(rate, num);
		},

		/**
		 * 处理历史费用
		 */
		handleHistoryFee : function(next) {
			var resourceAndCountMap = options.resourceAndCountMap;

			for (var i in resourceAndCountMap) {
				_instance.addFee({
							name : options.i18n[String.prototype.toUpperCase
									.call(i)],
							rate : model.getData(i + 'Rate'),
							num : resourceAndCountMap[i],
							unit : model.getData(i + 'Unit'),
							isChargeable : !!model.getData(i + 'Unit')
						})
			}

			this.updateCount(options.getCountFunc());

			next && next.process.apply(this, next.param);
		}
	}
}