/**
 * 管理多种portal
 * @module wizard.portal
 * @return {Object} api
 */
wizard.portal = (function() {
	var _portalMap = {},
	
	_currentPortal,

	checkArguments = function(portal, initiator) {
		if (wizard.utils.isFunction(initiator) && typeof portal === 'string'
				&& wizard.utils.trim(portal) !== '') {
			return true;
		}

		return false;
	};

	return {
		/**
		 * 添加portal
		 * @param {string} name of portal
		 * @param {function} initiator portal初始化器
		 */
		addPortal : function(portal, initiator) {
			var add = function(portal, initiator) {
				if (checkArguments(portal, initiator)) {
					_portalMap[portal] = initiator;
				} else {
					throw new Exception('Portal should be a string and initiator should be a function.');
				}
			};
			
			if (typeof portal === 'object') {
				for (var key in portal) {
					add(key, portal[key]);
				}
			} else {
				add(portal, initiator);
			}
		},

		/**
		 * 移除portal
		 * @param {string} name of portal
		 */
		removePortal : function(portal) {
			return delete _portalMap[portal];
		},

		/**
		 * 初始化portal，初始化后即进入该portal
		 * @param {string} name of portal
		 */
		initPortal : function(currentPortal) {
			if(_portalMap[currentPortal]) {
				_portalMap[_currentPortal = currentPortal]();
			} else {
				throw new Exception('The portal does not exist.');
			}
		},
		
		/**
		 * 获取当前portal
		 * @param {string} name of portal
		 */
		getCurrentPortal : function() {
			return _currentPortal;
		}
	}
}());
