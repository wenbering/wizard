/**
 * 信息确认step，信息汇总
 * @module  wizard.steps.summary
 */
wizard.steps.summary = {
	id : 'infoSummary',

	/**
	 * 显示的数据
	 * @type Object
	 */
	data : {
		domainName : '',
		dataCenterName : '',
		name : '',
		applyCount : 0,
		networkName : '',
		bandwidthText : '',
		deadline : '',
		purposeDesc : '',
		comment : ''
	},

	begin : function() {
		this.handle.updateSummary();

//		$('#footer').addClass('footerLine');
	},
	
	handle : wizard.handlers.summary,

	i18n : {
		'zh_CN' : {
			title : '信息确认',
			items : {
				domainName : '域',
				dataCenterName : '数据中心',
				name : '名称',
				networkName : '网络',
				bandwidthText : '带宽',
				applyCount : '数量',
				deadline : '到期时间',
				purposeDesc : '用途描述',
				comment : '备注'
			},
			
			values : {
				unlimited : '无限制'
			}
		},

		'en_US' : {
			title : 'Information Summary',
			items : {
				domainName : 'Domain',
				dataCenterName : 'Data Center',
				name : 'Name',
				networkName : 'Network',
				bandwidthText : 'Bandwidth',
				applyCount : 'Count',
				deadline : 'Deadline',
				purposeDesc : 'Description',
				comment : 'Comment'
			},
			
			values : {
				unlimited : 'Unlimited'
			}
		}
	}
};