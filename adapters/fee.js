/**
 * �Ʒ�api����
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
		 * �ƷѶ���ʵ��
		 * @return {Fee}
		 */
		getInstance : function() {
			return _instance;
		},

		/**
		 * �Ʒ�jquery����
		 * @return {jQuery}
		 */
		getDom : function() {
			return $fee;
		},
		
		/**
		 * ��ȡ����
		 * @param {string} resType ��Դ����
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
		 * ���¼Ʒ���Դ����
		 * @param {number} val ����
		 */
		updateCount : function(val) {
			_instance.update({
						account : val
					});
		},

		/**
		 * ���мƷ�
		 * @param {string} resType ��Դ����
		 * @param {number} num ��Դ����
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
		 * ������ʷ����
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