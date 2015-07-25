/**
 * 配置计算资源step
 * 
 * @module wizard.steps.computeRes
 */
wizard.steps.computeRes = {
	id : 'configComputeRes',

	validate : function() {
		var computeResHandler = this.handle;

		return {
			validate : computeResHandler.validate(),
			showWarning : true,
			warningText : computeResHandler.getWarningText()
		}
	},

	init : function() {
		var model = wizard.model, cpu = model.getData('cpuCoreCount') || 2, ram = model
				.getData('ramSize')
				|| 4;

		this.handle.select(cpu, ram);
	},

	end : function() {
		var self = this;
		model.saveData({
					'cpuText' : model.getData('cpuCoreCount')
							+ self.i18n.cpuUnit,
					'ramText' : model.getData('ramSize') + self.i18n.ramUnit
				});
	},

	handle : wizard.handlers.computeRes,

	i18n : {
		'zh_CN' : {
			title : '配置计算资源',
			cpuTitle : 'CPU',
			ramTitle : 'RAM',
			cpuUnit : '核心',
			ramUnit : 'GB'
		},

		'en_US' : {
			title : 'Configure Compute',
			cpuTitle : 'CPU',
			ramTitle : 'RAM',
			cpuUnit : 'Core',
			ramUnit : 'GB'
		}
	},

	clear : function() {
		wizard.model.removeData(['cpuCoreCount', 'ramSize']);
	}
}