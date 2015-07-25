/**
 * 提供工具函数
 *
 * @module wizard.utils 
 */
wizard.utils = (function() {

	var classTypes = {},

	forEach = (function() {
		var forEach = Array.prototype.forEach;

		return forEach ? function(array, action) {
			forEach.call(array, action);
		} : function(array, action) {
			if (!action)
				return;

			for (var i = 0, len = array.length; i < len; i++) {
				action(array[i], i, array);
			}
		};
	}());

	forEach('Boolean Number String Function Array Date RegExp Object Undefined'
					.split(' '), function(val, i) {
				classTypes["[object " + val + "]"] = val.toLowerCase();
			});

	return {
		/**
		 * 磁盘单位格式化为GB
		 * @param {number} size
		 * @return {number} 
		 */
		formatDiskSizeToGB : function(size) {
			if (isNaN(size))
				return 0;
			return parseFloat(size) / 1024 / 1024 / 1024;
		},

		/**
		 * 调整按钮布局
		 * @param {{}} 
		 */
		adjustBtnGroupLayout : function(userOptions) {

			var options = {
				$parent : {},
				$buttons : {},
				maxMargin : 30,
				maxWidth : 300,
				minWidth : 146,
				ratio : 0.1
			};

			options = wizard.utils.mixin(options, userOptions);

			var len = options.$buttons.length, wholeWidth = options.$parent
					.width(), width = (options.$parent.width() - 20 * len) / len;

			options.$buttons.css({
						'float' : 'left',
						'margin' : '10px',
						'min-width' : '146px',
						'width' : width,
						'max-width' : '300px'
					});
		},

		/**
		 * 继承
		 * @param {Function} constructor
		 * @param {Object} prototype
		 * @return {Object} 
		 */
		inherit : function(constructor, prototype) {
			var F = constructor;
			F.prototype = prototype;
			F.prototype.constructor = constructor;

			return new F();
		},

		/**
		 * mixin
		 * @param {Object} target
		 * @param {...Object} sources
		 * @return {Object} 
		 */
		mixin : function(target, /* 多个source */sources) {
			var length = arguments.length, source, value;

			if (length === 1) {
				return target;
			}

			for (var i = 1; i < length; i++) {
				source = arguments[i];

				for (var key in source) {
					value = source[key];

					if (value !== undefined) {
						target[key] = source[key];
					}
				}
			}

			return target;
		},

		/**
		 * es5 Array.prototype.forEach shim
		 */
		forEach : forEach,

		/**
		 * 类型判断
		 * @param {} obj
		 * @return {string} 类型字符串
		 */
		type : function(obj) {
			return obj === null ? String(obj)
					: classTypes[Object.prototype.toString.call(obj)]
							|| 'object';
		},

		/**
		 * 是否为函数
		 * @param {} obj
		 * @return {boolean} 
		 */
		isFunction : function(obj) {
			return wizard.utils.type(obj) === 'function';
		},

		/**
		 * 对象数组删除与属性值匹配的项
		 * @param {Array.<Object>} array
		 * @param {string} propertyName
		 * @param {string} propertyValue
		 */
		objectArrayRemoveItemByProperty : function(array, propertyName,
				propertyValue) {
			var obj;
			for (var i = 0, len = array.length; i < len; ++i) {
				obj = array[i];
				if (obj && (obj[propertyName] === propertyValue)) {
					array.splice(i, 1);
					i--;
				}
			}
		},

		/**
		 * dialog，单例
		 * @param {string} dialog类型，warn,confirm等
		 * @return {Object} dialog实例
		 */
		dialog : (function() {
			var instance = {};
			return function(type) {
				if (instance[type]) {
					return instance[type];
				}

				//TODO
				return instance[type] = new BC.showDialog(null, type);
			}
		}()),

		method : function(obj, name, f) {
			if (wizard.utils.isFunction(f)) {
				obj[name] = f;
			}
		},

		/**
		 * 乐观锁
		 * @param {Array.<Object>} array
		 * @param {string} propertyName
		 * @param {string} propertyValue
		 */
		optimisticLock : function() {

			var _version = 0, _timeoutHandler,

			_optimisticLock = function(versionStatic, callback) {
				if (_version === versionStatic) {
					callback();
				}
			};

			return {
				exec : function(callback, time) {
					time = time || 0;

					clearTimeout(_timeoutHandler);
					_timeoutHandler = setTimeout(function() {
								_optimisticLock(++_version, callback);
							}, time);
				}
			}
		},

		/**
		 * 获取包含相应属性的DOM元素集合
		 * @param {Element} rootNode
		 * @param {string} attributeName
		 * @return {NodeList}
		 */
		getElementsWithAttribute : function(rootNode, attributeName) {
			if (!rootNode || rootNode.nodeType != 1)
				return [];

			var results = [];
			if (rootNode.getAttribute(attributeName) !== null)
				results.push(rootNode);

			var descendants = rootNode.getElementsByTagName("*");
			for (var i = 0, j = descendants.length; i < j; i++)
				if (descendants[i].getAttribute(attributeName) !== null)
					results.push(descendants[i]);

			return results;
		},

		/**
		 * 存取元素内文本
		 * @param {Element} element
		 * @param {string} text
		 * @return {(text|undefined)}
		 */
		textContent : function(element, text) {
			if (typeof element.nodeType === 'undefined'
					|| element.nodeType !== 1)
				return;

			var textMethod = typeof element.textContent !== 'undefined'
					? 'textContent'
					: 'innerText';

			if (typeof text === 'undefined') {
				return element[textMethod];
			} else {
				element[textMethod] = text;
			}
		},

		/**
		 * es5 String.prototype.trim shim
		 * @param {Element} rootNode
		 * @param {string} attributeName
		 * @return {NodeList}
		 */
		trim : function(str) {
			if (this.type(str) !== 'string') return;
			
			return str.trim ? str.trim() : str.replace(/^\s*|\s*$/g, '');
		},

		arrayForEach : forEach
	}
}());