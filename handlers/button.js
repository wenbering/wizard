/**
 * wizard导航按钮控制
 * 
 * @module wizard.handlers.button
 * 
 * @param {} userOptions
 * @return {Object} api
 */
wizard.handlers.button = function(userOptions) {
	var self = this, model = wizard.model,

	options = wizard.utils.mixin({
				locale : 'zh_CN',
				//按钮
				buttons : {
					next : '#next',
					prev : '#prev',
					submit : '#submit',
					cancel : '#cancel',
					edit : '#edit',
					resubmit : '#resubmit',
					discard : '#discard'
				},
				//portal对应的按钮的控制逻辑
				portalAction : {
					'apply' : function() {
						buttonController.edit.obj.hide();
						buttonController.resubmit.obj.hide();
						buttonController.discard.obj.hide();

						buttonController.resubmit.status = -1;
					},
					'create' : function() {
						buttonController.edit.obj.hide();
						buttonController.resubmit.obj.hide();
						buttonController.discard.obj.hide();

						buttonController.resubmit.status = -1;
					},
					'edit' : function() {
						buttonController.next.obj.show();
						buttonController.prev.obj.show();
						buttonController.discard.obj.show();
						buttonController.edit.obj.hide();

						buttonController.submit.status = -1;
					},
					'history' : function() {
						buttonController.prev.obj.hide();
						buttonController.next.obj.hide();
						buttonController.submit.obj.hide();
						buttonController.resubmit.obj.hide();
						buttonController.discard.obj.hide();
						buttonController.edit.obj.show();

						buttonController.submit.status = -1;
						buttonController.resubmit.status = -1;
					}
				},
				i18n : {
					'zh_CN' : {
						next : '下一步',
						prev : '上一步',
						submit : '提交',
						cancel : '取消',
						edit : '编辑',
						resubmit : '重新提交',
						discard : '废弃'
					},
					'en_US' : {
						next : 'Next',
						prev : 'Previous',
						submit : 'Submit',
						cancel : 'Cancel',
						edit : 'Edit',
						resubmit : 'Resubmit',
						discard : 'Discard'
					}
				}
			}, userOptions),

	resourceDeliveryHandler = self.getBaseModule('resourceDelivery'),

	i18n = options.i18n[options.locale] || options.i18n,

	buttons = options.buttons,

	buttonController = {},

	_getBtnListener = function(btn) {
		switch (btn) {
			case 'cancel' :
				return function() {
					window.history.back(-1);
				};

			case 'submit' :
				return resourceDeliveryHandler.submit;

			case 'edit' :
				return resourceDeliveryHandler.edit;

			case 'resubmit' :
				return resourceDeliveryHandler.resubmit;

			case 'discard' :
				return resourceDeliveryHandler.discard;
		}
	},

	resetAllButtonsStatus = function() {
		for (var i in buttons) {
			buttonController[i].status = 0;
		}
	};

	for (var i in buttons) {
		buttonController[i] = buttonController[i] || {};
		buttonController[i].obj = $(buttons[i]).text(i18n[i]);
		//status值为-1，则按钮不会显示
		buttonController[i].status = 0;
	}

	$('#stepControlBtnGroup button').on('click', function(e) {
				var listener = _getBtnListener(e.target.id);
				listener && listener();
			});

	var submit = buttonController.submit, resubmit = buttonController.resubmit;
	wizard.pubSub.subscribe('enterLast', 'button', function() {
				submit.status != -1 && submit.obj.show();
				resubmit.status != -1 && resubmit.obj.show();
			});

	wizard.pubSub.subscribe('leaveLast', 'button', function() {
				submit.status != -1 && submit.obj.hide();
				resubmit.status != -1 && resubmit.obj.hide();
			});

	return {
		/**
		 * 根据portal切换按钮
		 */
		switchBtn : function() {
			resetAllButtonsStatus();
			var action = options.portalAction[wizard.portal.getCurrentPortal()];
			wizard.utils.isFunction(action) && action();
		}
	}
};