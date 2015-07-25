/**
 * summary step对应的hanlde
 * @module wizard.handlers.summary
 * @return {}
 */
wizard.handlers.summary = function() {

	var self = this, model = wizard.model, summary = {},

	summaryInfo = function() {
		summary = {};

		var datas = self.data;
		for (var i in datas) {
			var data = model.getData(i);
			if (typeof self.i18n.items[i] === 'undefined') continue;
			summary[self.i18n.items[i]] = (typeof data === 'undefined'
					? ""
					: self.i18n.values[data] || data);
		}
	},

	getSummary = function() {
		$('#infoSummary tr').remove();

		summaryInfo();

		var array = [];
		for (var i in summary) {
			array.push('<tr><td class = "title basicInfoLabel">' + i
					+ '</td><td></td><td id=sum_' + i
					+ ' class="description basicInfoValue">' + summary[i]
					+ '</td></tr>');
		}

		$(array.join('')).appendTo($('#infoSummary table'))
	};

	getSummary();

	return {
		/**
		 * 初始化/重置滚动条
		 */
		initScroll : function() {
			$('.scroll-pane').jScrollPane();
		},
		
		/**
		 * 更新汇总的信息
		 */
		updateSummary : function() {
			summaryInfo();

			for (var i in summary) {
				$('#sum_' + i).text(summary[i]);
			}

			this.initScroll();
		},

		/**
		 * 修改信息项
		 * @param {string} operate 操作类型
		 * @param {string} 操作参数
		 */
		modify : function(operate, param) {
			switch (operate) {
				case 'remove' :
					if (param instanceof Array) {
						for (var i in param) {
							delete self.data[param[i]];
							delete self.i18n[param[i]];
						}
					} else {
						delete self.data[param];
						delete self.i18n[param];
					}
					break;
			}

			getSummary();
		}
	
	}
};