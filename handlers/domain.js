/**
 * 选择域step对应的handle
 * 
 * @module wizard.handlers.domain
 * 
 * @param {} userOptions
 * @return {Object} api
 */
wizard.handlers.domain = function(userOptions) {

	var self = this, model = wizard.model, i18n = self.i18n,

	options = wizard.utils.mixin({
		stepId : this.id,
		containerId : 'domainGroup',
		loadDataURL : '/singleTypeApply/singleTypeApplyofVMAction!getDomains.action',
		dsName : 'domainDS',
		selectedEventName : 'domainSelected',
		ajaxDoneEventName : 'domain',
		isDisabled : false,

		click : function(e, i) {
			if ($(this).hasClass('disabled')) {
				$('#selectDomain .description').addClass('alertInfo')
						.text(self.i18n.cannotChangeDomain);
				return false;
			}

			var obj = dataCenter.getDataStore(options.dsName).getRowSet()
					.getData()[i];

			model.saveData({
						'domainId' : obj.id,
						'domainName' : obj.name,
						'domainDesc' : obj.desc,
						'isAdmin' : !!obj.admin,
						'targetDomainId' : obj.parentId
					});
					
			$('#selectDomain .description').removeClass('alertInfo')
					.text(obj.desc);

			wizard.pubSub.publish(options.selectedEventName);
		},
		dataValidate : function() {
			var domainId = model.getData('domainId');
			return typeof domainId !== 'undefined' && domainId !== null;
		},

		prompt : {
			noResource : i18n.noDomain,
			resourceHasBeenDeleted : i18n.domainHasBeDeleted
		}
	}, userOptions),

	buttonGroup = wizard.handlers.buttonGroup(options);

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