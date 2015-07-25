/**
 * 数据中心
 * @module wizard.model
 * 
 * @param {Object} dataCenter 数据中心对象
 */
wizard.model = function(dataCenter) {

	if (!dataCenter || typeof dataCenter !== 'object'
			|| wizard.util.isFunction(dataCenter.getParameter)) {
		throw new Error('DataCenter is not available!');
	}

	return {
		/**
		 * 存数据
		 * @param {string|Array.<{name : string, data}>} name，可以接收key/value，也可以接收数据对象数组批量添加 
		 * @param {} data
		 */
		saveData : function(name, data) {
			if (arguments.length == 2) {
				dataCenter.setParameter(name, data);
			} else {
				for (var i in name) {
					dataCenter.setParameter(i, name[i]);
				}
			}
		},
		
		/**
		 * 取数据
		 * @param {string} name
		 */
		getData : function(name) {
			return dataCenter.getParameter(name);
		},

		/**
		 * 移除数据
		 * @param {string|Array.<string>} name，单一或批量删除
		 */
		removeData : function(name) {
			if (typeof name != 'object') {
				dataCenter.removeParameter(name);
			} else {
				for (var i in name) {
					dataCenter.removeParameter(name[i]);
				}
			}
		},

		/**
		 * 合并dc数据到当前数据中心
		 * @param {Object} dc
		 */
		updateDataCenter : function(dc) {
			var parameters = dc.parameters;
			if (!parameters)
				return;

			this.saveData(parameters);
		}
	}
};
