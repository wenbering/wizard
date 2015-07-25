/**
 * 资源交付相关操作
 * 
 * @module wizard.handlers.resourceDelivery
 * 
 * @param {} userOptions
 * @return {Object} api
 */
wizard.handlers.resourceDelivery = function(userOptions) {

	var self = this, options = {
		profileURL : '',
		canEditURL : '/dashboard/task!isCanWithDraw.action',
		submitURL : '',
		cancelURL : '',
		resubmitURL : '',
		discardURL : '',

		editBtnId : 'edit',
		approveInfoPos : {
			titleContainerId : 'stepTitleContainer',
			titleId : 'stepTitle',
			feeId : 'fee'
		},

		dataNames : {
			approveStatus : 'approveStatus',
			approveInfo : 'approveInfo',
			isCanWithDraw : 'isCanWithDrawDS',
			workItemId : 'workItemId'
		},

		stepTitleContainerId : 'stepTitleContainer',

		locale : 'zh_CN',
		
		beforeResubmit: null,

		i18n : {
			'zh_CN' : {
				AGREE : '同意：',
				DISAGREE : '驳回：',
				submitSuccess : '您的申请已提交成功，请等待管理员审批'
			},
			'en_US' : {
				AGREE : 'Agree: ',
				DISAGREE : 'Disagree: ',
				submitSuccess : "Your application is submitted, please wait for administrator's approval"
			}
		}
	},

	options = wizard.utils.mixin({}, options, userOptions);

	options.i18n = options.i18n[locale];

	return {
		/**
		 * 取资源申请单
		 * @param {function} 用于LinearProcessManager
		 */
		getProfile : function(next) {
			var loadCallback = function(dc) {
				wizard.model.updateDataCenter(dc);
				next && next.process.apply(this, next.param);
			};

			BC.ajax(options.profileURL, {}, loadCallback, null, null, true);
		},

		/**
		 * 添加审批信息
		 * @param {function} 用于LinearProcessManager
		 */
		addApproveInfo : function(next) {
			$('#' + options.stepTitleContainer + '#approveInfo').remove();

			var model = wizard.model, info = model
					.getData(options.dataNames.approveInfo), approveStatus = model
					.getData(options.dataNames.approveStatus);

			if (info && approveStatus) {
				info = options.i18n[approveStatus] + info;
				var margin = 20, $title = $('#stepTitle'), titleWidth = 200, $infoDiv = $('<div id="approveInfo" title="'
						+ info
						+ '" style="float:left; color:#fc671e; font-size:14px; max-width:500px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">'
						+ info + '</div>').insertAfter($title), $fee = $('#fee'), $parent = $title
						.parent(), restWidth = $parent.width() - titleWidth
						- $fee.outerWidth();

				var infoDivWidth = $infoDiv.width();
				margin = (restWidth - infoDivWidth) / 2;

				$infoDiv.css({
							'margin-left' : margin,
							'height' : $parent.height(),
							'line-height' : $parent.height() + 4 + 'px'
						});
			}

			next && next.process.apply(this, next.param);
		},

		/**
		 * 判断申请单是否可以编辑
		 */
		canWithdraw : function() {
			var model = wizard.model, $edit = $('#' + options.editBtnId);

			$edit.hide();

			var loadCallback = function(dc) {
				dataCenter = dc;
				$edit[model.getData(options.dataNames.isCanWithDraw)
						? 'show'
						: 'hide']();
			};

			BC.ajax(options.canEditURL, {
						workItemId : model
								.getData(options.dataNames.workItemId)
					}, loadCallback, null, null, true);
		},

		/**
		 * 提交资源申请单
		 */
		submit : function() {
			var canSubmit;
			if (options.beforeResubmit) {
				canSubmit = options.beforeResubmit();
			}
			
			if (!canSubmit) return;
			
			var loadCallback = function(dc) {
				wizard.utils.dialog().show('success',
						options.i18n.submitSuccess, function() {
							window.history.back(-1);
						});
			};

			BC.ajax(options.submitURL, {}, loadCallback, null, null, true);
		},

		/**
		 * 重新提交资源申请单
		 */
		resubmit : function() {
			var canSubmit;
			if (options.beforeResubmit) {
				canSubmit = options.beforeResubmit();
			}
			
			if (!canSubmit) return;
			
			var loadCallback = function() {
				wizard.utils.dialog().show('success',
						options.i18n.submitSuccess, function() {
							window.history.back(-1);
						});
			};

			BC.ajax(options.resubmitURL, {}, loadCallback, null, null, true);
		},

		/**
		 * 编辑资源申请单
		 */
		edit : function() {
			var loadCallback = function() {
				wizard.pubSub.publish('portalChanged', 'edit');
			};

			BC.ajax(options.cancelURL, {}, loadCallback, null, null, true);
		},
		
		/**
		 * 废弃资源申请单
		 */
		discard : function() {
			var loadCallback = function() {
				window.history.back(-1);
			};

			BC.ajax(options.discardURL, {}, loadCallback, null, null, true);
		}

	}
}