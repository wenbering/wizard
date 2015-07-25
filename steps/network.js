/**
 * 网络step
 * @module  wizard.steps.network
 */
wizard.steps.network = {
	id : 'configNetwork',

	init : function() {
		var bandwidth = wizard.model.getData('bandwidth'), networkId = wizard.model
				.getData('networkId'), handle = this.handle, index,

		linearProcessManager = new wizard.LinearProcessManager(), 
		select = function() {
			if ((index = handle.detectAvailableNetworkIndex()) !== false) {
				networkId ? handle.select(networkId, 'id') : handle
						.select(index);
			}
		};

		handle.reset(!!bandwidth, bandwidth);

		// 需要自动加载网络
		if (handle.needAutoLoaded()) {
			linearProcessManager.add(handle.getGrid().loadDS);
		}

		linearProcessManager.add(select).exec();
	},

	end : function() {
		var model = wizard.model, self = this;
		model.saveData({
					'bandwidthText' : !model.getData('isbandwidthLimited')
							? model.getData('bandwidth')
									+ self.i18n.bandWidthUnit
							: self.i18n.unlimited
				});
	},

	validate : function() {
		var self = this;
		return {
			validate : (function() {
				var row = self.handle.getGrid().getSelectRow();
				return !!row && (row.data.totalIP - row.data.usedIP) >= 0;
			})(),
			showWarning : true,
			warningText : self.handle.getGrid().getWarningText()
		}
	},

	clear : function() {
		wizard.model.removeData(['networkId']);
	},

	handle : wizard.handlers.network,

	i18n : {
		'zh_CN' : {
			title : '配置网络',
			requiredPublicIPTitle : '需要公共IP',
			requiredPublicIPDesc : '有公共IP的机器可以直接通过公共IP访问',
			isbandWidthLimitedTitle : '带宽限制',
			isbandWidthLimitedDesc : '外部访问该应用节点所进行的流量限制',
			bandWidthUnit : 'Mbps',
			networkTitle : '网络',

			grid : {
				gridId : 'networkGrid',
				name : "网络名称",
				startIP : '起始IP',
				endIP : '终止IP',
				mask : '子网掩码',
				gateway : "网关",
				vlan : 'VLAN',
				usage : 'IP使用情况'
			},

			networkIsLoading : "正在加载网络，请稍候",
			selectNetworkValidateInfo : "请选择可用网络",
			networkHasBeDeleted : "您申请时选择的网络已不存在，请重新选择",
			noNetwork : "无可用网络",
			no_free_ip : '该网络无空闲IP',
			no_available_network : '无可用网络',
			unlimited : '无限制'
		},

		'en_US' : {
			title : 'Configure Network',
			requiredPublicIPTitle : 'Required Public IP',
			requiredPublicIPDesc : 'The VM who has public IP can be accessed through the IP',
			isbandWidthLimitedTitle : 'Bandwidth Limitation',
			isbandWidthLimitedDesc : 'Traffic limitation of the external access of nodes',
			bandWidthUnit : 'Mbps',
			networkTitle : 'Network',

			grid : {
				gridId : 'networkGrid',
				name : "Name",
				startIP : 'Start IP',
				endIP : 'End IP',
				mask : 'Subnet Mask',
				gateway : "Gateway",
				vlan : 'VLAN',
				usage : 'IP Usage'
			},

			networkIsLoading : "Network data is loading, please wait a moment",
			selectNetworkValidateInfo : "Please select a available network",
			networkHasBeDeleted : "The network you selected is not existed",
			noNetwork : "There is no available network",
			no_free_ip : 'There is no free IP in selected network',
			no_available_network : 'There is no available network',
			unlimited : 'Unlimited'
		}
	}

};

