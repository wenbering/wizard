/**
 * 选择域step
 * @module  wizard.steps.domain
 */
wizard.steps.domain = {
	id : 'selectDomain',

	validate : function() {
		var self = this;
		return {
			validate : self.handle.validate(),
			showWarning : true,
			warningText : function() {
				return !self.handle.isLoaded()
						? self.i18n.domainIsLoading
						: self.i18n.selectDomainValidateInfo
			}
		}
	},

	init : function() {
		var self = this, domainId = wizard.model.getData('domainId'), 
		
		linearProcessManager = new wizard.LinearProcessManager(), method = this.handle.select, param;

		// TODO
		if (wizard.getCurrentPortal() !== 'EDIT') {
			param = [0, 'index'];
		} else {
			param = [domainId, 'id'];
		}

		linearProcessManager.add(this.handle.loadData);

		domainId
				? linearProcessManager.add(method, domainId, 'id')
				: linearProcessManager.add(method, 0, 'index');
		// .add(this.handle.hideDomainStep).exec();

		linearProcessManager.add(function() {
					self.handle.isSingleButton() && self.removeStep();
				}).exec();

	},

	handle : wizard.handlers.domain,

	i18n : {
		'zh_CN' : {
			title : '选择域',
			titleText : '您属于多个域，请选择在哪个域申请负载均衡',
			domainIsLoading : "正在加载域，请稍候",
			selectDomainValidateInfo : "请选择域",
			cannotChangeDomain : "编辑申请单时不能变更申请域",
			domainHasBeenDeleted : "您申请的域已不存在(您可能已经被管理员移出该域)"
		},

		'en_US' : {
			title : 'Select Domain',
			titleText : 'You belong to multiple domain, please choose one.',
			domainIsLoading : "Domain data is loading, please wait a moment",
			selectDomainValidateInfo : "Please select a domain",
			cannotChangeDomain : "You can not change the domain when editing the application form",
			domainHasBeenDeleted : "The domain you applied is not existed"
		}
	},

	clear : function() {
		wizard.model.removeData(['domainId', 'domainName', 'domainDesc',
				'isAdmin']);
	}
};
