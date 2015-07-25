/**
 * network step对应的handle
 * 
 * @module wizard.handlers.network
 * 
 * @param {} userOptions
 * @return {Object} api
 */
wizard.handlers.network = function(userOptions) {

	var self = this, utils = wizard.utils, model = wizard.model, initIsbandWidthLimited = false,

	_clearData = function() {
		model.removeData(['networkId', 'networkName']);
	},

	options = utils.mixin({
				gridId : 'networkGrid',
				sliderId : 'sliderId',
				bandwidthSwitchId : 'isbandWidthLimited',
				dsName : 'networkDS',
				loadURL : '/cloudapp/cloudappCreationAndApplyAction!getNetwork.action',
				whenLoad : null,
				filterHandler : null,
				getRelevanceIdFunc : function() {
					return model.getData(model.getData('isAdmin')
							? 'targetDomainId'
							: 'domainId')
							+ model.getData('dataCenterId');
				},
				afterAjaxDone : _clearData,
				beforeRowClick : function(data, i) {
					if (!_canSelect(i)) {
						return false;
					}
				},
				afterRowClick : function(data) {
					model.saveData({
								'networkId' : data.id,
								'networkName' : data.name
							});
				},
				beforeBind : _sortNetwork,

				i18n : {
					isLoading : self.i18n.networkIsLoading,
					selectValidateInfo : self.i18n.selectNetworkValidateInfo,
					hasBeDeleted : self.i18n.networkHasBeDeleted,
					noResource : self.i18n.noNetwork
				}
			}, userOptions),

	_networkGrid = utils.inherit(function() {
				this.init();
			}, new wizard.handlers.Grid(options)),

	_bandwidthSwitch = new wizard.providers.Switch(options.bandwidthSwitchId),

	_slider = wizard.providers.slider({
				sliderId : 'bandWidthSlider',
				inputId : 'bandWidthValue',
				rateCallback : function(account) {
					model.getData('isbandWidthLimited') !== false
							&& (account = 0);
					model.saveData('bandwidth', parseFloat(account));
				},
				sliderOptions : {
					max : 100,
					minMoveValue : 10,
					value : 10,
					step : 10,
					scales : [10, 20, 50, 100]
				}
			}),

	_getDataByIndex = function(index) {
		return _networkGrid.getDS().getRowSet().getData()[index];
	},

	_sortNetwork = function() {
		_networkGrid.getData().sort(function(a, b) {
					return b.freeIP - a.freeIP;
				});
	},

	_canSelect = function(i) {
		if (i !== undefined) {
			var dataI = _networkGrid.getData()[i];
			if (dataI.usedIP >= dataI.totalIP) {
				_networkGrid.clearSelection();
				utils.dialog.show('warn', self.i18n.no_free_ip);
				return false;
			}
		}

		return true;
	},

	_detectAvailableNetworkIndex = function() {
		var index = -1;
		for (var data = _networkGrid.getData(), len = data.length, i = 0; i < len; ++i) {
			if (data[i].usedIP < data[i].totalIP) {
				index = i;
				break;
			}
		}

		return index;
	};

	_bandwidthSwitch.setListener(function(e, data) {
				model.saveData('isbandWidthLimited', !data.value);
				_slider.disable(!data.value);
			});

	_bandwidthSwitch.setStatus(initIsbandWidthLimited);

	utils.isFunction(options.whenLoad) && options.whenLoad(function() {
		(self.getInited() && (self.getBaseModule('carousel').getIndex() >= self.index))
				&& self.clear();
		_networkGrid.loadDS();
	});

	return {
		/**
		 * 取network列表实例
		 * @return {Grid}
		 */
		getGrid : function() {
			return _networkGrid;
		},

		/**
		 * 取slider实例
		 * @return {Slider}
		 */
		getSlider : function() {
			return _slider;
		},

		/**
		 * 重置
		 * @param {boolean} isbandWidthLimited
		 * @param {number} bandwidth
		 */
		reset : function(isbandWidthLimited, bandwidth) {
			_bandwidthSwitch.setStatus(isbandWidthLimited);
			_bandwidthSwitch.trigger(isbandWidthLimited);

			_slider.reset(bandwidth);
		},

		/**
		 * 选择网络
		 * @param {(string|number)} param
		 * @param {string} type, id
		 */
		select : function(param, type) {
			if (type === 'id') {
				_networkGrid.selectById(param);
			} else {
				_networkGrid.select(param);
			}
		},

		/**
		 * 获取可用网络的index
		 * @return {number}
		 */
		detectAvailableNetworkIndex : function() {
			var i = _detectAvailableNetworkIndex();
			if (i == -1) {
				wizard.utils.dialog().show('warn',
						self.i18n.no_available_network);
				return false;
			}

			return i;
		},

		/**
		 * 解绑网络列表数据
		 */
		unbind : _networkGrid.unbind,

		getDataByIndex : _getDataByIndex,

		/**
		 * 获取选中行
		 */
		getSelectRows : _networkGrid.getSelectRows,

		/**
		 * 判断网络是否可选
		 * @return {boolean}
		 */
		canSelect : _canSelect,

		/**
		 * 判断网络是否加载完成
		 * @return {boolean}
		 */
		isLoaded : _networkGrid.isLoaded,

		/**
		 * 加载网络
		 */
		load : function() {
			_networkGrid.loadDS();
		},

		/**
		 * 是否需要自动加载网络，否则由whenLoad指定加载时机
		 * @return {boolean}
		 */
		needAutoLoaded : function() {
			return !options.whenLoad;
		},

		hideCell : function(colName) {
			BC.hideCell([colName], _networkGrid.getInstance());
		}
	}
};
