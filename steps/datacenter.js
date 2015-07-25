/**
 * 选择数据中心step
 * @module  wizard.steps.datacenter
 */
wizard.steps.datacenter = {
	id : 'selectDatacenter',

	validate : function() {
		var self = this;
		return {
			validate : self.handle.validate(),
			showWarning : true,
			warningText : function() {
				return !self.handle.isLoaded()
						? self.i18n.datacenterIsLoading
						: self.i18n.selectDatacenterValidateInfo
			}
		}
	},

	handle : wizard.handlers.datacenter,

	i18n : {
		'zh_CN' : {
			title : '选择数据中心',
			titleText : '您属于多个数据中心，请选择在哪个数据中心申请负载均衡',
			datacenterIsLoading : "正在加载数据中心，请稍候",
			selectDatacenterValidateInfo : "请选择数据中心",
			datacenterHasBeenDeleted : "您申请的数据中心已不存在(您可能已经被管理员移出该数据中心)"
		},

		'en_US' : {
			title : 'Select Datacenter',
			titleText : 'You belong to multiple datacenters, please choose one.',
			datacenterIsLoading : "datacenter data is loading, please wait a moment",
			selectDatacenterValidateInfo : "Please select a datacenter",
			datacenterHasBeenDeleted : "The datacenter you applied is not existed"
		}
	},

	clear : function() {
		wizard.model.removeData(['dataCenterId', 'dataCenterName', 'dataCenterDesc']);
	}
};
