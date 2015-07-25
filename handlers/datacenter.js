/**
 * 选择数据中心step对应的handle
 * 
 * @module wizard.handlers.datacenter
 * 
 * @param {} userOptions
 * @return {Object} api
 */
wizard.handlers.datacenter = function(userOptions) {

	var self = this, model = wizard.model, i18n = self.i18n,

	options = wizard.utils.mixin({
		stepId : self.id,
		containerId : 'datacenterGroup',
		loadDataURL : '/resourceApp/resourceAppAction!getPools.action',
		whenLoad : function() {
			wizard.pubSub.subscribe('domainSelected', options.stepId,
					function() {
						// 编辑时，在第一次进入数据中心选择步骤前，不清空数据
						(!self.getInited() || self.getInited() && (self.getBaseModule('carousel')
								.getIndex() >= self.index))
								&& self.clear();
						buttonGroup.loadData();
					});
		},
		getId: function(val) {
			return val.dataCenterId;
		},
		getLoadDataParams : function() {
			return {
				currentDomainId : model.getData('domainId'),
				targetDomainId : model.getData('targetDomainId')
			}
		},
		dsName : 'poolDS',
		selectedEventName : 'datacenterSelected',
		ajaxDoneEventName : 'datacenter',

		afterRendered : function() {
			var dcId = model.getData('dataCenterId');
			dcId ? this.select(dcId, 'id') : this.select(0, 'index');

			this.isSingleButton() && self.removeStep();
		},
		click : function(e, i) {
			var obj = dataCenter.getDataStore(options.dsName).getRowSet()
					.getData()[i];

			model.saveData({
						'dataCenterId' : obj.dataCenterId,
						'dataCenterName' : obj.dataCenterName,
						'dataCenterDesc' : obj.description
					});

			$('#' + options.containerId + ' .description')
					.removeClass('alertInfo').text(obj.desc);

			wizard.pubSub.publish(options.selectedEventName);
		},
		dataValidate : function() {
			var datacenterId = model.getData('dataCenterId');
			return typeof datacenterId !== 'undefined' && datacenterId !== null;
		},

		prompt : {
			noResource : i18n.noDatacenter,
			resourceHasBeenDeleted : i18n.datacenterHasBeenDeleted
		}
	}, userOptions),

	buttonGroup = wizard.handlers.buttonGroup(options);

	wizard.utils.isFunction(options.whenLoad) && options.whenLoad();

	/**
	 * 是否需要重新加载，可能已经缓存
	 * @return {boolean}
	 */
	buttonGroup.needToLoad = function(resource) {
		var dsPrefix = {
			'template' : model.getData('domainId'),
			'network' : (model.getData('isAdmin') ? model
					.getData('targetDomainId') : model.getData('domainId'))
					+ model.getData('dataCenterId')
		};
		if (dataCenter.getDataStore(dsPrefix[resource] + resource + 'DS')) {
			return false;
		}

		return true;
	};

	return buttonGroup;
};