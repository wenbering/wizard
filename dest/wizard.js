/**
 * name space of wizard
 *  
 */
var wizard = {
	
	/**
	 * adapters模块集合，封装底层插件，并返回通用的api，适配api，与上层解耦，保证上层调用的api不变
	 */
	adapters : {},
	
	/**
	 * handlers模块集合，组合调用adapters，实现基本完整的功能或步骤的部分逻辑
	 */
	handlers : {},
	
	/**
	 * steps模块集合，调用handlers，为步骤实例集合
	 */
	steps : {}
	
};
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
/**
 * 用于线性调用ajax，也可添加普通函数
 * 
 * @constructor
 */
function LinearProcessManager() {
	/**
	 * 管理器中的函数，顺序线性执行
	 * 
	 * @type {Array.<function>}
	 * @private
	 */
	this._processes = [];
}

LinearProcessManager.prototype = {
	constructor : LinearProcessManager,

	/**
	 * 添加函数，链式调用
	 * 
	 * @param {function}
	 *            process
	 * @param {Object}
	 *            param
	 * @return {this}
	 */
	add : function(process, param) {
		var params = Array.prototype.slice.call(arguments, 1, arguments.length);
		this._processes.push({
					process : process,
					param : params
				});

		return this;
	},

	/**
	 * 启动执行
	 * 
	 * @return {this}
	 */
	exec : function() {
		var _processes = this._processes, process;
		
		for (var i = 0, len = _processes.length; i < len; ++i) {
			_processes[i].param.push(_processes[i + 1]);
		}

		process = _processes.shift();

		process && process.process.apply(this, process.param);
		
		return this;
	}
};

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

/**
 * 订阅类
 * @constructor
 * 
 * @param {function} callback 回调
 * @param {function} dispose 销毁回调
 * @param {} stepId
 */
wizard.Subscription = function(callback, dispose, stepId) {
	this.stepId = stepId;
	this.isDisposed = false;

	this.dispose = function() {
		this.isDisposed = true;
		dispose && dispose();
	}

	this.callback = callback;
};

/**
 * 消息中心
 * @module wizard.pubSub
 */
wizard.pubSub = (function() {
	var _subscribers = {};

	return {
		/**
		 * 订阅
		 * @param {string} subject
		 * @param {string} stepId 用于在step移除后销毁其对事件的订阅
		 * @param {function} callback 
		 */
		subscribe : function(subject, stepId, callback) {
			if (!wizard.utils.isFunction(callback))
				return false;

			!_subscribers[subject] && (_subscribers[subject] = []);

			_subscribers[subject].push(new wizard.Subscription(callback,
					function() {

					}, stepId));

			return true;
		},

		/**
		 * 取消订阅，step移除时清除订阅
		 * @param {string} stepId
		 */
		unSubscribe : function(stepId) {
			for (var key in _subscribers) {
				wizard.utils.objectArrayRemoveItemByProperty(_subscribers[key],
						'stepId', stepId);
			}
		},

		/**
		 * 发布
		 * @param {string} subject
		 * @param {} params
		 */
		publish : function(subject, params) {
			if (!_subscribers[subject]) return;
			
			wizard.utils.arrayForEach(_subscribers[subject].slice(), function(subscription) {
				if (subscription && (subscription.isDisposed !== true) && subscription.callback) {
					subscription.callback.call(null, params);
				}
			})
		}
	}
}());
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

/**
 * step工厂
 * @module wizard.step
 * 
 * @param {{validate : function, init : function, begin : function, end : function, handle : function, i18n : Object}} 
 * 			参数为wizard.steps模块
 * 			模块结构为：{
 * 				id {string} 模块id,
 * 				init {function} 第一次进入该step时执行,
 * 				begin {function} 每次进入该step时执行,
 * 				end {function} 每次离开该step时执行,
 * 				handle {function} step被加入到wizard时自动执行，返回该step的api，供上面函数调用
 * 				i18n {Object} 国际化对象,
 * 				clear {function} 清除该步骤产生的数据
 * 			}
 * 			其中只有id为必需
 * 
 * @return {wizard.step}
 */
wizard.step = function(userOptions) {
	return new wizard.step.prototype._Init(userOptions);
}

/**
 * step索引
 * @static
 * @type Number
 */
wizard.step.index = 0;

wizard.step.prototype = {
	constructor : wizard.step,

	/**
	 * @constructor
	 * @private
	 * @param {} userOptions
	 */
	_Init : function(userOptions) {

		//step初始化标志
		var inited = false, utils = wizard.utils;

		/**
		 * inited getter
		 * @return {boolean}
		 */
		this.getInited = function() {
			return inited
		};

		/**
		 * inited setter true
		 * @return {boolean.1}
		 */
		this.inited = function() {
			return inited = true;
		};

		/**
		 * inited setter false
		 * @return {boolean.0}
		 */
		this.reset = function() {
			return inited = false;
		};

		/**
		 * 索引
		 * @type {number}
		 */
		this.index = wizard.step.index++;

		options = utils.mixin({
					validate : null,
					init : null,
					begin : null,
					end : null,
					handle : null,
					i18n : null
				}, userOptions);

		if (typeof options.id !== 'string' && utils.trim(options.id) === '') {
			throw new Error('Step instance should have an property named id.')
		}

		for (var i in options) {
			this[i] = options[i];
		}
	}
}

wizard.step.prototype._Init.prototype = wizard.step.prototype;

/**
 * stepbar插件api适配
 * 
 * @module wizard.adapters.stepBar
 * @param {Object} userOptions
 */
wizard.adapters.stepBar = function(userOptions) {

	var options = wizard.utils.mixin({
				container : '#stepBarContainer',
				stepTitles : []
			}, userOptions),

	init = function() {
		return $(options.container).stepbar({
					steps : options.stepTitles
				});
	},

	instance = init();

	return {
		/**
		 * @return {StepBar} stepbar实例
		 */
		getInstance : function() {
			return instance;
		},

		/**
		 * 动态增删改导航节点
		 * @param {} 
		 */
		splice : function() {
			if (arguments.length < 2) {
				throw new Error('stepBar.instance should have more than two parameters.');
			}

			var type = wizard.utils.type;
			if (type(arguments[0]) !== 'number'
					|| type(arguments[1]) !== 'number'
					|| (arguments[2] && type(arguments[2]) !== 'string')) {
				throw new Error('stepBar.instance : wrong type of parameters.');
			}

			Array.prototype.splice.apply(options.stepTitles, arguments);

			instance = init();
		}
	};
};


/**
 * �Ʒ�api����
 * 
 * @module wizard.adapters.fee
 * @param {Object} userOptions
 */
wizard.adapters.fee = function(userOptions) {

	var self = this, model = wizard.model, options = {
		container : '#fee',
		dsName : 'rateDS',

		getRelevanceIdFunc : function() {
			return model.getData('domainId');
		},

		resourceAndCountMap : {
			cpu : model.getData('cpuCoreCount'),
			memory : model.getData('ramSize'),
			storage : model.getData('dataDiskSize')
		},

		getCountFunc : function() {
			return model.getData('applyCount');
		},

		i18n : {}
	};

	options = wizard.utils.mixin(true, options, userOptions);

	var $fee = $(container), _instance,

	_handleFeeforUser = function(rate, num) {
	},

	_handleFeeforAdmin = function(rate, num) {
		_instance.addFee({
					name : options.i18n[rate.resType],
					rate : rate.ruleRate,
					num : num,
					unit : rate.resUnit,
					isChargeable : !!rate.resUnit
				});
	};

	_instance = $fee.applyfee({
				locale : locale
			});

	return {

		/**
		 * �ƷѶ���ʵ��
		 * @return {Fee}
		 */
		getInstance : function() {
			return _instance;
		},

		/**
		 * �Ʒ�jquery����
		 * @return {jQuery}
		 */
		getDom : function() {
			return $fee;
		},
		
		/**
		 * ��ȡ����
		 * @param {string} resType ��Դ����
		 * @return {Object}
		 */
		getRate : function(resType) {
			var ratesDS = dataCenter.getDataStore(options.getRelevanceIdFunc()
					+ options.dsName);
			if (!ratesDS)
				return;

			var rates = ratesDS.getRowSet().getData();
			for (var i in rates) {
				if (rates[i].resType == resType) {
					return rates[i];
				}
			}
		},

		/**
		 * ���¼Ʒ���Դ����
		 * @param {number} val ����
		 */
		updateCount : function(val) {
			_instance.update({
						account : val
					});
		},

		/**
		 * ���мƷ�
		 * @param {string} resType ��Դ����
		 * @param {number} num ��Դ����
		 */
		handleFee : function(resType, num) {
			var rate = this.getRate(resType);
			if (!rate)
				return;

			model.getData('isAdmin')
					? _handleFeeforAdmin(rate, num)
					: _handleFeeforUser(rate, num);
		},

		/**
		 * ������ʷ����
		 */
		handleHistoryFee : function(next) {
			var resourceAndCountMap = options.resourceAndCountMap;

			for (var i in resourceAndCountMap) {
				_instance.addFee({
							name : options.i18n[String.prototype.toUpperCase
									.call(i)],
							rate : model.getData(i + 'Rate'),
							num : resourceAndCountMap[i],
							unit : model.getData(i + 'Unit'),
							isChargeable : !!model.getData(i + 'Unit')
						})
			}

			this.updateCount(options.getCountFunc());

			next && next.process.apply(this, next.param);
		}
	}
}
/**
 * grid ���˹���
 * 
 * @module wizard.adapters.filter
 * @param {} userOptions
 */
wizard.adapters.filter = function(userOptions) {

	var options = wizard.utils.mixin({
				gridId : '',
				filterAttr : '',
				idPrefix : '',
				unieap : unieap
			}, userOptions),

	filterAttr = options.filterAttr, gridId = options.gridId, idPrefix = options.idPrefix, unieap = options.unieap, _filterDSCollection = {};

	if (!unieap || !wizard.utils.isFunction(unieap.byId))
		return;

	var _getGrid = (function() {
		var _grid;
		return function() {
			return _grid || (_grid = unieap.byId(gridId))
		}
	})(),

	_filterId = (function() {
		var _array = [];
		for (var i in filterAttr) {
			_array.push(idPrefix + i.substring(0, 1).toUpperCase()
					+ i.substring(1, i.length));
		}

		return _array;
	})(),

	_filterType = {
		INPUT : 0,
		COMBOBOX : 1
	},

	_bindCombobox = function(id, ds) {
		unieap.byId(id).getDataProvider().setDataStore(ds);
	},

	_unbindCombobox = function(id) {
		var obj = unieap.byId(id);
		obj.getDataProvider().clear();
		obj.setText('');
	},

	_bindFilter = function(filterDSs) {
		filterDSs = filterDSs || {};

		var j = 0;
		for (var i in filterAttr) {
			if (filterAttr[i] == _filterType.COMBOBOX) {
				_bindCombobox(_filterId[j], filterDSs[i]);
			}

			j++;
		}
	},

	_generateFilterDS = function(ds, relevanceId) {
		if (!ds)
			return;

		var dss = {}, dataArray = ds.getRowSet().getData();

		for (var i in filterAttr) {
			var filter = i;
			dss[filter] = new unieap.ds.DataStore(filter);
			rowset = new unieap.ds.RowSet();
			rowset.insertRow({
						'name' : wizardProviders.wizardOptions.i18n.normal.comboboxAll,
						'value' : ''
					});

			$.each(dataArray, function(i, val) {
						var rows = rowset.getData();
						for (var j in rows) {
							if (rows[j].name == val[filter])
								return true;
						}
						rowset.insertRow({
									'name' : val[filter],
									'value' : val[filter]
								});
					});

			dss[filter].setRowSet(rowset);
		}

		return _filterDSCollection[relevanceId] = dss;
	},

	_escape = function(str) {
		return str.replace(/(\.|\\|\^|\$|\*|\+|\?|\||\[|\]|\(|\)|\}|\{)/g, '\\'
						+ '$1');
	},

	_getFilterObj = function(name) {
		var j = 0;
		for (var i in filterAttr) {
			if (i == name)
				break;
			j++;
		}

		return filterAttr[name] == _filterType.COMBOBOX ? unieap
				.byId(_filterId[j]) : $('#' + _filterId[j]);
	},

	filter = function() {
		var filterManager = _getGrid().getManager('FilterManager'), filterObj, filtObj, pattern = [];

		filterManager.cancelFilter();

		for (var i in filterAttr) {
			filterObj = _getFilterObj(i);
			var value = filterObj.getValue
					? filterObj.getValue()
					: _escape(filterObj.val());
			filtObj = {};
			filtObj.condition = {};

			if (!value || 'null' == value)
				continue;

			filtObj.condition[i] = {
				name : i,
				relation : filterAttr[i] == _filterType.INPUT ? 'like' : '=',
				value : value
			}

			filtObj.pattern = '${' + i + '}';
			filterManager.setFilter(i, filtObj);
		}

		filterManager.doFilter();
	},

	cancelFilter = function() {
		_getGrid().getManager('FilterManager').cancelFilter();
	},

	_init = function() {
		var filterObj;

		for (var i in filterAttr) {
			filterObj = _getFilterObj(i);
			if (filterObj.onChange) {
				filterObj.onChange = function(val) {
					filter();
					this.domNode.title = val;
				};
			} else {
				filterObj.on('change', filter);
				(function(filterObj) {
					filterObj.on('keyup', function(e) {
								e.keyCode == 13 && filterObj.trigger('change');
							});
				})(filterObj);
			}
		}
	};

	_init();

	return {
		/**
		 * ����grid���ݣ����Զ�ΪΪ���й���combobox��������
		 * @param {DataStore} ds ����
		 * @param {string} ID ����
		 */
		bind : function(ds, relevanceId) {
			_bindFilter(_filterDSCollection[relevanceId]
					|| _generateFilterDS(ds, relevanceId));
		},

		/**
		 * ����
		 */
		unbind : function() {
			_bindFilter({});

			var j = 0;
			for (var i in filterAttr) {
				if (filterAttr[i] == _filterType.COMBOBOX) {
					_unbindCombobox(_filterId[j]);
				} else {
					$(_filterId[j]).val('');
				}

				j++;
			}
		},

		filter : filter,

		cancelFilter : cancelFilter
	}
}
wizard.adapters.grid = function(userOptions) {

	var options = wizard.utils.mixin({
				unieap : unieap,
				gridId : '',
				loadDoneEvent : 'ajaxdone'
			}, userOptions),

	unieap = options.unieap, gridId = options.gridId;

	if (!unieap || !wizard.utils.isFunction(unieap.byId)) return;
	
	var _getGrid = (function() {
		var _grid;
		return function() {
			return _grid || (_grid = unieap.byId(gridId))
		}
	})(),

	_isLoaded = false,

	_currentDS,

	_selectIndex,

	_getData = function() {
		_currentDS = _getGrid().getBinding().getDataStore();
		return _currentDS ? _currentDS.getRowSet().getData() : [];
	},

	_selectImmediate = function(para, type, deleteWarn, donotHaveWarn, callback) {
		var data = _getData();

		if (type == 'id') {
			var idx = -1;
			for (var i in data) {
				if (data[i].id == para) {
					idx = i;
					break;
				}
			}

			if (idx != -1) {
				_selectImmediate(idx, '', '', '', callback);
				return idx;
			} else {
				wizard.utils.dialog.show('warn', deleteWarn);
				return -1;
			}
		} else {
			para = para || 0;

			if (para >= data.length) {
				wizardOptions.dialog.show('warn', donotHaveWarn);
				return -1;
			} else {
				_selectIndex = para;
				_getGrid().getManager('SelectionManager').setSelect(para);

				callback && callback(para);

				return para;
			}
		}
	},

	_triggerClick = function(index) {
		_getGrid().getManager('ViewManager').onRowClick({
					rowIndex : index
				});
	};

	return {

		getInstance : _getGrid,

		bind : function(ds, callback) {
			callback && callback();
			_getGrid().getBinding().setDataStore(_currentDS = ds);
		},

		unbind : function() {
			_getGrid().setDataStore(null);
		},

		i18n : function(col, name) {
			_view.setHeaderName(col, name);
		},

		isLoaded : function(bool) {
			if (typeof bool != 'undefined') {
				return _isLoaded = bool;
			} else {
				return _isLoaded;
			}
		},

		getDS : function() {
			return _getGrid().getBinding().getDataStore();
		},

		setDS : function(ds) {
			_currentDS = ds;
		},

		onRowClick : function(callback) {
			callback && (_getGrid().getViewManager().onRowClick = callback);
		},

		getData : _getData,

		selectImmediate : _selectImmediate,

		select : function(para, type, deleteWarn, donotHaveWarn, resourceName,
				callback) {
			var i = -1;
			if (!this.isLoaded()) {
				wizard.pubSub.subscribe(options.loadDoneEvent, function(e, p) {
							if (p == resourceName) {
								i = _selectImmediate(para, type, deleteWarn,
										donotHaveWarn, callback);
								i > -1 && _triggerClick(i);
							}
						});
			} else {
				i = _selectImmediate(para, type, deleteWarn, donotHaveWarn,
						callback);
				i > -1 && _triggerClick(i);
			}

		},

		getSelectRow : function() {
			var rows = _getGrid().getManager('SelectionManager')
					.getSelectedRows();
			return rows && rows[0];
		},

		getSelectRows : function() {
			return _getGrid().getManager('SelectionManager').getSelectedRows();
		},

		clearSelection : function() {
			_getGrid().getManager('SelectionManager').clearSelection();
			// $('#' + gridId + ' .u-grid-row-selected')
			// .removeClass('u-grid-row-selected');
		},

		triggerClick : _triggerClick,

		getSelectionManager : function() {
			return _getGrid().getManager('SelectionManager');
		}
	}
}
/**
 * slider��input��װ
 * 
 * @module wizard.adapters.slider
 * @param {Object} userOptions
 */
wizard.adapters.slider = function(userOptions) {

	var utils = wizard.utils,

	options = $.extend(true, {
				sliderId : '',
				inputId : '',
				rateCallback : null,
				sliderOptions : {
					range : "min",
					min : 0,
					value : 0,
					slide : function(event, ui) {
						$input.val(value = parseFloat(ui.value));
						options.rateCallback && options.rateCallback(value);
					},
					step : 1
				}
			}, userOptions),

	value, oldCallback,

	sliderOptions = options.sliderOptions,
	
	rateCallback = options.rateCallback,

	$slider = $('#' + options.sliderId), $input = $('#' + options.inputId),

	validateInput = function(val) {
		var min = sliderOptions.minMoveValue || sliderOptions.min, max = sliderOptions.maxMoveValue
				|| sliderOptions.max;

		if (isNaN(val) || (val + "").indexOf('.') >= 0
				|| (val + "").charAt(0) == '0') {
			$input.val(value = min);
		} else if (val < min) {
			$input.val(value = min);
		} else if (val > max) {
			$input.val(value = max);
		}

		// if (inputId == 'bandWidthValue' && (value % 10)) {
		$input.val(value = Math.round(value / sliderOptions.step)
				* sliderOptions.step);
		// }

		return value;
	},

	init = function() {
		$slider.slider(sliderOptions);

		$input.val(sliderOptions.value || sliderOptions.minMoveValue
				|| sliderOptions.min).trigger('change');
	};

	$input.off('keypress').on('keypress', function(e) {
				(e.keycode > 47 || e.keycode < 58) && $input.val(value);
			}).off('change').on('change', function() {
				$slider.slider('value', validateInput(value = $input.val()));

				rateCallback && rateCallback(value);
			});

	init();

	return {

		/**
		 * @return sliderʵ��
		 */
		getSlider : function() {
			return $slider;
		},

		/**
		 * ����
		 * @param {boolean} bool
		 */
		disable : function(bool) {
			var $parent = $slider.parent();
			$parent.stop(false, true);
			$parent[bool ? 'slideUp' : 'slideDown']();

			rateCallback ? rateCallback(value) : oldCallback
					&& oldCallback(value);

			if (bool) {
				rateCallback && (oldCallback = rateCallback);
				rateCallback = null;
			} else {
				oldCallback && (rateCallback = oldCallback);
			}
		},

		/**
		 * ����
		 * @param {number} value
		 */
		reset : function(value) {
			value && (sliderOptions.value = value);
			init();
		},

		/**
		 * ȡֵ
		 * @return {number}
		 */
		getValue : function() {
			return $slider.slider('option', 'value');
		}
	}
};
/**
 * switch����api���䣬�ط�װ
 * 
 * @constructor
 * 
 * @module wizard.adapters.Switch
 * @param {string} container
 */
wizard.adapters.Switch = function(container) {

	var instance = $(container).bootstrapSwitch();

	/**
	 * @return {Swtich} switchʵ��
	 */
	this.getInstance = function() {
		return instance;
	};
};

wizard.providers.Switch.prototype = {
	constructor : wizard.providers.Switch,

	/**
	 * �����л�������
	 * @param {function} listener
	 */
	setListener : function(listener) {
		this.getInstance().on('switch-change', listener);
	},

	/**
	 * ����״̬
	 * @param {boolean} status
	 */
	setStatus : function(status) {
		this.getInstance().bootstrapSwitch('setState', !!status);
		this.trigger();
	},

	/**
	 * ����
	 * @param {boolean} status
	 */
	trigger : function(status) {
		this.getInstance().trigger('switch-change', {
					value : status
				});
	}
};
/**
 * carousel����api����
 * 
 * @module wizard.adapters.carousel
 * @param {Object} userOptions
 */
wizard.adapters.carousel = function(options) {

	var that = this, utils = wizard.utils, options = utils.mixin({
				container : '.viewport',
				validate : null,
				beforeMove : null,
				afterMove : null
			}, options),

	_$container = $(options.container),

	instance = _$container.tinycarousel();

	_$container.off('next').on('next', function(e, p) {
		_$container.tinycarousel({
					validate : utils.isFunction(options.validate) ? !!options
							.validate(e, p) : true
				});
	});

	utils.isFunction(options.beforeMove)
			&& _$container.off('beforemove').on('beforemove', function(e, p) {
						if (instance.isLast()) {
							wizard.pubSub.publish('enterLast');
						} else {
							wizard.pubSub.publish('leaveLast');
						}
						
						options.beforeMove(e, p);
					});

	_$container.off('move').on('move', function(e, p) {
				utils.isFunction(options.afterMove) && options.afterMove(e, p);
			});

	return {

		/**
		 * �ƶ���step
		 * @param {number} index �ƶ�������Ϊindex��step
		 * @param {boolean} needTraversal �Ƿ�ִ��ǰ�沽����init begin end
		 * @param {boolean} nonAnimate �Ƿ���Ҫ����
		 */
		moveTo : function(index, needTraversal, nonAnimate) {
			var index = arguments[0];
			if (!arguments[1]) {
				instance.move(index, nonAnimate);
			} else {
				for (var i = 0; i <= index; ++i) {
					instance.move(i);
				}
			}
		},

		/**
		 * ����ʵ��
		 */
		getInstance : function() {
			return instance;
		},

		/**
		 * �Ƴ�step
		 * @param {number} index
		 */
		remove : function(index) {
			instance.getSlide(index).remove();
			instance.update();
		},

		/**
		 * ���ص�ǰstep
		 */
		getCurrentSlide : function() {
			return instance.getCurrentSlide();
		},

		/**
		 * ���ص�ǰ����
		 */
		getIndex : function() {
			return instance.getIndex();
		},

		getSlide : function(i) {
			return instance.getSlide(i);
		}
	}
};

/**
 * @module wizard.handlers.Grid
 * @constructor
 * @param {} userOptions
 */
wizard.handlers.Grid = function(userOptions) {

	var options = wizard.utils.mixin({
				gridId : '',
				stepId : '',
				dsName : '',
				loadURL : '',
				selectType : 'click',
				filterHandler : null,
				getRelevanceIdFunc : null,
				afterAjaxDone : null,
				beforeBind : null,
				beforeRowClick : null,
				afterRowClick : null,
				beforeSelect : null,
				afterSelect : null,
				beforeDeselect : null,
				i18n : {}
			}, userOptions),

	self = this, _grid = new wizard.adapters.grid(options.gridId), _selection = _grid
			.getSelectionManager(), dataCenter = wizard.utils.model
			.getDataCenter();

	self.loadDS = function(next) {
		var getRelevanceIdFunc = options.getRelevanceIdFunc;

		if (dataCenter
				.getDataStore((getRelevanceIdFunc && getRelevanceIdFunc() || '')
						+ options.dsName)) {
			_grid.isLoaded(true);

			wizard.pubSub.publish('ajaxdone', options.gridId);
			return;
		}

		var loadCallback = function(dc) {
			var relevanceId = getRelevanceIdFunc && getRelevanceIdFunc() || '';
			dataCenter.addDataStore(relevanceId + options.dsName, dc
							.getDataStore(relevanceId + options.dsName));

			_grid.isLoaded(true);

			wizard.pubSub.publish('ajaxdone', options.gridId);

			next && next.process.apply(this, next.param);
		};

		BC.ajax(options.loadURL, {}, loadCallback);
	};

	self.init = function() {
		if (options.selectType === 'click') {
			var onRowClick = function(e) {
				var i = e.rowIndex;

				var ds = _grid.getDS();
				if (!ds) {
					return;
				}

				var data = ds.getRowSet().getData()[i];

				var canClick = true;
				options.beforeRowClick
						&& (canClick = options.beforeRowClick(data, i));
				if (canClick !== false) {
					_grid.selectImmediate(i);
					options.afterRowClick && options.afterRowClick(data);
				}
			};

			_grid.onRowClick(onRowClick);
		}

		options.beforeSelect
				&& (_selection.onBeforeSelect = options.beforeSelect);
		options.afterSelect && (_selection.onAfterSelect = options.afterSelect);
		options.beforeDeselect
				&& (_selection.onBeforeDeselect = options.beforeDeselect);

		wizard.pubSub.subscribe('ajaxdone', options.gridId, function(p) {
					if (p == options.gridId) {
						options.afterAjaxDone && options.afterAjaxDone();
						self.bind();
					}
				});
	};

	self.getData = _grid.getData,

	self.getDS = _grid.getDS,

	self.bind = function() {
		options.beforeBind && options.beforeBind();

		self.unbind();

		// TODO
		// _step.clearData();

		var getRelevanceIdFunc = options.getRelevanceIdFunc;
		_grid.bind(dataCenter.getDataStore((getRelevanceIdFunc
				&& getRelevanceIdFunc() || '')
				+ options.dsName));
		options.filterHandler
				&& options.filterHandler.bind(_grid.getDS(),
						(getRelevanceIdFunc && getRelevanceIdFunc())
								|| options.gridId);

		_grid.clearSelection();
	};

	self.clearSelection = _grid.clearSelection,

	self.getSelectRow = _grid.getSelectRow,

	self.getSelectRows = _grid.getSelectRows,

	self.unbind = function() {
		_grid.unbind();
		options.filterHandler && options.filterHandler.unbind();
	};

	self.filter = function() {
		options.filterHandler.filter();
	};

	self.validate = function() {
		return !!_grid.getSelectRow();
	};

	self.getWarningText = function() {
		return !_grid.isLoaded()
				? options.i18n.isLoading
				: options.i18n.selectValidateInfo
	};

	self.select = function(num, callback) {
		_grid.select(num, null, options.i18n.hasBeDeleted || "",
				options.i18n.noResource || "", options.gridId, callback);
	};

	self.selectById = function(id, callback) {
		_grid.select(id, 'id', options.i18n.hasBeDeleted || "",
				options.i18n.noResource || "", options.gridId, callback);
	};

	self.selectImmediate = _grid.selectImmediate;

	self.isLoaded = function() {
		return _grid.isLoaded();
	};

	self.setOptions = function(_options) {
		options = $.extend(true, options, _options);

		options.beforeSelect
				&& (_selection.onBeforeSelect = options.beforeSelect);
		options.afterSelect && (_selection.onAfterSelect = options.afterSelect);
		options.beforeDeselect
				&& (_selection.onBeforeDeselect = options.beforeDeselect);
	};

	self.getInstance = function() {
		return _grid.getInstance();
	}
};

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
/**
 * Button Group
 * 
 * @module wizard.handlers.buttonGroup
 * 
 * @param {} userOptions
 * @return {Object} api
 */
wizard.handlers.buttonGroup = function(userOptions) {
	var options = wizard.utils.mixin({
				stepId : '',
				container : '',
				loadDataURL : '',
				dsName : '',
				selectedEventName : '',
				ajaxDoneEventName : '',
				isDisabled : false,
				dataValidate : function() {
					return true;
				},
				afterRendered : null,
				click : null,
				prompt : {
					noResource : '',
					resourceHasBeenDeleted : ''
				}
			}, userOptions),

	$buttonGroup = $('#' + options.container), isLoaded = false, $buttons,

	// _optimisticLockHandler = new wizard.utils.optimisticLockProvider();

	//构造button group
	render = function() {
		$buttonGroup.empty();

		var ds = dataCenter.getDataStore(options.dsName);
		if (!ds)
			return;

		var data = ds.getRowSet().getData(), domArray = [];

		if (data == null)
			return;

		$.each(data, function(i, val) {
					domArray.push("<button type='button' class='btn"
							// + (options.isDisabled ? " disabled" : "")
							+ "' title='" + val.name + "'data-id='"
							+ (options.getId ? options.getId(val) : val.id)
							+ "'>" + BC.escapeBracketSymbol(val.name)
							+ "</button>");
				});

		$buttons = $(domArray.join('')).appendTo($buttonGroup);

		wizard.utils.adjustBtnGroupLayout({
					$parent : $buttonGroup,
					$buttons : $buttons
				});
	},

	_select = function(para, type) {
		if (type == 'index') {
			if ($buttons.length <= para) {
				wizard.utils.dialog().show('warn', i18n.noResource);
			} else {
				$buttons.eq(para).trigger('click');
			}
		} else if (type == 'id') {
			var $button = $buttons.filter(function() {
						return $(this).data('id') == para;
					});

			if ($button && $button.length == 1) {
				$button.addClass('active').trigger('click');
			} else {
				wizard.utils.dialog().show('warn',
						options.prompt.resourceHasBeenDeleted);
			}
		}
	},

	_disable = function(bool) {
		if (bool !== undefined) {
			options.isDisabled = bool;
			$buttonGroup.find('button').not('.active')[bool === true
					? 'addClass'
					: 'removeClass']('disabled');
		} else {
			return options.isDisabled;
		}
	};

	$buttonGroup.on('click', 'button', function(e) {
				if (options.click) {
					var result = options.click
							.apply(this, [
											e,
											$buttonGroup.find('button')
													.index($(this))]);
					if (result === false) {
						return result;
					} else {
						_disable() && _disable(true);
					}
				}
			});

	return {

		/**
		 * 加载数据
		 */
		loadData : function(next) {
			var that = this;
			var loadCallback = function(dc) {
				try {
					wizard.model.updateDataCenter(dc);

					wizard.pubSub
							.publish('ajaxdone', options.ajaxDoneEventName);

					isLoaded = true;

					render();

					options.afterRendered && options.afterRendered.apply(that);

					next && next.process.apply(this, next.param);
				} catch (e) {
				}
			};

			BC.ajax(options.loadDataURL, options.getLoadDataParams
							&& options.getLoadDataParams() || {}, loadCallback);
		},

		/**
		 * 校验
		 */
		validate : function() {
			return !!options.dataValidate()
					&& this.isLoaded()
					&& (!options.isDisabled
							&& $buttonGroup.find('button').filter(function() {
										return $(this).hasClass('active')
									}).length || options.isDisabled);
		},

		/**
		 * 是否加载完成
		 * @return {boolean}
		 */
		isLoaded : function() {
			return isLoaded;
		},

		/**
		 * 是否仅有一项，可能需要隐藏该step
		 * @return {boolean}
		 */
		isSingleButton : function() {
			return $buttonGroup.find('button').length == 1;
		},

		/**
		 * 选择
		 * @param {} p 参数
		 * @param {string} type 选择类型
		 */
		select : function(p, type, next) {
			type = type || 'index';
			_select(p, type);

			next && next.process.apply(this, next.param);
		},

		/**
		 * 禁用
		 * @param {boolean}
		 */
		disable : _disable
	}
};
/**
 * 选择域step对应的handle
 * 
 * @module wizard.handlers.domain
 * 
 * @param {} userOptions
 * @return {Object} api
 */
wizard.handlers.domain = function(userOptions) {

	var self = this, model = wizard.model, i18n = self.i18n,

	options = wizard.utils.mixin({
		stepId : this.id,
		containerId : 'domainGroup',
		loadDataURL : '/singleTypeApply/singleTypeApplyofVMAction!getDomains.action',
		dsName : 'domainDS',
		selectedEventName : 'domainSelected',
		ajaxDoneEventName : 'domain',
		isDisabled : false,

		click : function(e, i) {
			if ($(this).hasClass('disabled')) {
				$('#selectDomain .description').addClass('alertInfo')
						.text(self.i18n.cannotChangeDomain);
				return false;
			}

			var obj = dataCenter.getDataStore(options.dsName).getRowSet()
					.getData()[i];

			model.saveData({
						'domainId' : obj.id,
						'domainName' : obj.name,
						'domainDesc' : obj.desc,
						'isAdmin' : !!obj.admin,
						'targetDomainId' : obj.parentId
					});
					
			$('#selectDomain .description').removeClass('alertInfo')
					.text(obj.desc);

			wizard.pubSub.publish(options.selectedEventName);
		},
		dataValidate : function() {
			var domainId = model.getData('domainId');
			return typeof domainId !== 'undefined' && domainId !== null;
		},

		prompt : {
			noResource : i18n.noDomain,
			resourceHasBeenDeleted : i18n.domainHasBeDeleted
		}
	}, userOptions),

	buttonGroup = wizard.handlers.buttonGroup(options);

	/**
	 * 是否需要重新加载，可能已经缓存
	 * @return {boolean}
	 */
	buttonGroup.needToLoad = function(resource) {
		var dsPrefix = {
			'template' : model.getData('domainId'),
			'network' : (model.getData('isAdmin') ? model
					.getData('targetDomainId') : model.getData('domainId'))
					+ model.getData('dataCenterId')
		};
		if (dataCenter.getDataStore(dsPrefix[resource] + resource + 'DS')) {
			return false;
		}

		return true;
	};

	return buttonGroup;
};
/**
 * 选择数据中心step对应的handle
 * 
 * @module wizard.handlers.datacenter
 * 
 * @param {} userOptions
 * @return {Object} api
 */
wizard.handlers.datacenter = function(userOptions) {

	var self = this, model = wizard.model, i18n = self.i18n,

	options = wizard.utils.mixin({
		stepId : self.id,
		containerId : 'datacenterGroup',
		loadDataURL : '/resourceApp/resourceAppAction!getPools.action',
		whenLoad : function() {
			wizard.pubSub.subscribe('domainSelected', options.stepId,
					function() {
						// 编辑时，在第一次进入数据中心选择步骤前，不清空数据
						(!self.getInited() || self.getInited() && (self.getBaseModule('carousel')
								.getIndex() >= self.index))
								&& self.clear();
						buttonGroup.loadData();
					});
		},
		getId: function(val) {
			return val.dataCenterId;
		},
		getLoadDataParams : function() {
			return {
				currentDomainId : model.getData('domainId'),
				targetDomainId : model.getData('targetDomainId')
			}
		},
		dsName : 'poolDS',
		selectedEventName : 'datacenterSelected',
		ajaxDoneEventName : 'datacenter',

		afterRendered : function() {
			var dcId = model.getData('dataCenterId');
			dcId ? this.select(dcId, 'id') : this.select(0, 'index');

			this.isSingleButton() && self.removeStep();
		},
		click : function(e, i) {
			var obj = dataCenter.getDataStore(options.dsName).getRowSet()
					.getData()[i];

			model.saveData({
						'dataCenterId' : obj.dataCenterId,
						'dataCenterName' : obj.dataCenterName,
						'dataCenterDesc' : obj.description
					});

			$('#' + options.containerId + ' .description')
					.removeClass('alertInfo').text(obj.desc);

			wizard.pubSub.publish(options.selectedEventName);
		},
		dataValidate : function() {
			var datacenterId = model.getData('dataCenterId');
			return typeof datacenterId !== 'undefined' && datacenterId !== null;
		},

		prompt : {
			noResource : i18n.noDatacenter,
			resourceHasBeenDeleted : i18n.datacenterHasBeenDeleted
		}
	}, userOptions),

	buttonGroup = wizard.handlers.buttonGroup(options);

	wizard.utils.isFunction(options.whenLoad) && options.whenLoad();

	/**
	 * 是否需要重新加载，可能已经缓存
	 * @return {boolean}
	 */
	buttonGroup.needToLoad = function(resource) {
		var dsPrefix = {
			'template' : model.getData('domainId'),
			'network' : (model.getData('isAdmin') ? model
					.getData('targetDomainId') : model.getData('domainId'))
					+ model.getData('dataCenterId')
		};
		if (dataCenter.getDataStore(dsPrefix[resource] + resource + 'DS')) {
			return false;
		}

		return true;
	};

	return buttonGroup;
};
/**
 * 配置计算资源step对应的handle
 * 
 * @module wizard.handlers.computeResource
 * 
 * @param {} userOptions
 * @return {Object} api
 */
wizard.handlers.computeResource = function(userOptions) {
	var model = wizard.model, self = this,

	options = wizard.utils.mixin({
				cpuDomId : 'cpuGroup',
				ramDomId : 'ramGroup',
				computeRes : {
					cpus : [{
								value : 1,
								mapRams : [0.5, 1, 2]
							}, {
								value : 2,
								mapRams : [2, 4, 8]
							}, {
								value : 4,
								mapRams : [4, 8, 16]
							}]
				},

				onCPUClick : null,
				onRAMClick : null,
				onValidate : null,
				getCustomWarningText : null
			}, userOptions),

	_$cpuDom, _$ramDom,

	_$cpuGroup = $('#' + options.cpuDomId), _$ramGroup = $('#'
			+ options.ramDomId);

	var renderCPUs = function() {

		var cpuDomArray = [];

		$.each(options.computeRes.cpus, function(i, val) {
					var label = val.value + ' ' + self.i18n.cpuUnit;

					cpuDomArray
							.push("<button type='button' class='btn' title='"
									+ label + "' data-count='" + val.value
									+ "'>" + label + "</button>");
				});

		_$cpuGroup.empty().append(_$cpuDom = $(cpuDomArray.join('')));
	},

	renderRAMs = function(cpu, p) {
		var $buttons = _$cpuGroup.find('button'), ramDomArray = [];

		ramDomArray.length = 0;
		$.each(options.computeRes.cpus[$buttons.index($(cpu))].mapRams,
				function(i, val) {
					var label = val + ' ' + self.i18n.ramUnit;

					ramDomArray.push("<button type='button' class='btn"
							+ (val === p ? " active" : "") + "' title='"
							+ label + "' data-count='" + val + "'>" + label
							+ "</button>");
				});

		_$ramGroup.empty().append(_$ramDom = $(ramDomArray.join('')));

		_$ramGroup.find('button.active').trigger('change', p);
	};

	_$cpuGroup.on('change click', 'button', function(e, p) {
				var cpuCoreCount = $(this).data('count');
				model.saveData('cpuCoreCount', cpuCoreCount);

				var feeHandler = this.getBaseModule('fee');
				if (feeHandler) {
					feeHandler.handleFee('CPU', parseFloat(cpuCoreCount));
					feeHandler.handleFee('MEMORY', 0);
				}

				var self = this;
				renderRAMs(self, p);

				options.onCPUClick && options.onCPUClick(cpuCoreCount);
			});

	_$ramGroup.on('change click', 'button', function(e, p) {
				var ramSize = $(this).data('count');

				model.saveData('ramSize', parseFloat(ramSize));

				var feeHandler = this.getBaseModule('fee');
				feeHandler && feeHandler.handleFee('MEMORY', ramSize);

				options.onRAMClick && options.onRAMClick(p);
			});

	_getValue = function() {
		return {
			cpu : _$cpuDom.filter('.active').data('count'),
			ram : _$ramDom.filter('.active').data('count')
		};
	};

	renderCPUs();

	return {
		/**
		 * 该步骤校验
		 */
		validate : function() {
			var valueObj = _getValue(), cpu = valueObj.cpu, ram = valueObj.ram;

			model.saveData({
						'cpuCoreCount' : cpu,
						'ramSize' : parseFloat(ram)
					});

			var validateFlag = !!(cpu && ram);

			return options.onValidate
					? (options.onValidate() && validateFlag)
					: validateFlag;
		},

		/**
		 * 选择CPU和内存
		 * @param {number} selectCPU
		 * @param {number} selectRAM
		 */
		select : function(selectCPU, selectRAM) {
			// TODO : look like a bug in ie8 when triggering click
			_$cpuDom.filter(function() {
						return $(this).data('count') == selectCPU
					}).addClass('active').trigger('change', selectRAM)
					.siblings().removeClass('active');
		},

		/**
		 * 取值
		 * @return {{cpu : number, ram : number}}
		 */
		getValue : _getValue,

		/**
		 * 警告信息
		 * @return {string}
		 */
		getWarningText : function() {
			return options.getCustomWarningText
					&& options.getCustomWarningText()
					|| self.i18n.configComputeResValidateInfo
		},

		setOptions : function(userOptions) {
			options = wizard.utils.mixin(options, userOptions);
		}
	}
};
/**
 * network step对应的handle
 * 
 * @module wizard.handlers.network
 * 
 * @param {} userOptions
 * @return {Object} api
 */
wizard.handlers.network = function(userOptions) {

	var self = this, utils = wizard.utils, model = wizard.model, initIsbandWidthLimited = false,

	_clearData = function() {
		model.removeData(['networkId', 'networkName']);
	},

	options = utils.mixin({
				gridId : 'networkGrid',
				sliderId : 'sliderId',
				bandwidthSwitchId : 'isbandWidthLimited',
				dsName : 'networkDS',
				loadURL : '/cloudapp/cloudappCreationAndApplyAction!getNetwork.action',
				whenLoad : null,
				filterHandler : null,
				getRelevanceIdFunc : function() {
					return model.getData(model.getData('isAdmin')
							? 'targetDomainId'
							: 'domainId')
							+ model.getData('dataCenterId');
				},
				afterAjaxDone : _clearData,
				beforeRowClick : function(data, i) {
					if (!_canSelect(i)) {
						return false;
					}
				},
				afterRowClick : function(data) {
					model.saveData({
								'networkId' : data.id,
								'networkName' : data.name
							});
				},
				beforeBind : _sortNetwork,

				i18n : {
					isLoading : self.i18n.networkIsLoading,
					selectValidateInfo : self.i18n.selectNetworkValidateInfo,
					hasBeDeleted : self.i18n.networkHasBeDeleted,
					noResource : self.i18n.noNetwork
				}
			}, userOptions),

	_networkGrid = utils.inherit(function() {
				this.init();
			}, new wizard.handlers.Grid(options)),

	_bandwidthSwitch = new wizard.providers.Switch(options.bandwidthSwitchId),

	_slider = wizard.providers.slider({
				sliderId : 'bandWidthSlider',
				inputId : 'bandWidthValue',
				rateCallback : function(account) {
					model.getData('isbandWidthLimited') !== false
							&& (account = 0);
					model.saveData('bandwidth', parseFloat(account));
				},
				sliderOptions : {
					max : 100,
					minMoveValue : 10,
					value : 10,
					step : 10,
					scales : [10, 20, 50, 100]
				}
			}),

	_getDataByIndex = function(index) {
		return _networkGrid.getDS().getRowSet().getData()[index];
	},

	_sortNetwork = function() {
		_networkGrid.getData().sort(function(a, b) {
					return b.freeIP - a.freeIP;
				});
	},

	_canSelect = function(i) {
		if (i !== undefined) {
			var dataI = _networkGrid.getData()[i];
			if (dataI.usedIP >= dataI.totalIP) {
				_networkGrid.clearSelection();
				utils.dialog.show('warn', self.i18n.no_free_ip);
				return false;
			}
		}

		return true;
	},

	_detectAvailableNetworkIndex = function() {
		var index = -1;
		for (var data = _networkGrid.getData(), len = data.length, i = 0; i < len; ++i) {
			if (data[i].usedIP < data[i].totalIP) {
				index = i;
				break;
			}
		}

		return index;
	};

	_bandwidthSwitch.setListener(function(e, data) {
				model.saveData('isbandWidthLimited', !data.value);
				_slider.disable(!data.value);
			});

	_bandwidthSwitch.setStatus(initIsbandWidthLimited);

	utils.isFunction(options.whenLoad) && options.whenLoad(function() {
		(self.getInited() && (self.getBaseModule('carousel').getIndex() >= self.index))
				&& self.clear();
		_networkGrid.loadDS();
	});

	return {
		/**
		 * 取network列表实例
		 * @return {Grid}
		 */
		getGrid : function() {
			return _networkGrid;
		},

		/**
		 * 取slider实例
		 * @return {Slider}
		 */
		getSlider : function() {
			return _slider;
		},

		/**
		 * 重置
		 * @param {boolean} isbandWidthLimited
		 * @param {number} bandwidth
		 */
		reset : function(isbandWidthLimited, bandwidth) {
			_bandwidthSwitch.setStatus(isbandWidthLimited);
			_bandwidthSwitch.trigger(isbandWidthLimited);

			_slider.reset(bandwidth);
		},

		/**
		 * 选择网络
		 * @param {(string|number)} param
		 * @param {string} type, id
		 */
		select : function(param, type) {
			if (type === 'id') {
				_networkGrid.selectById(param);
			} else {
				_networkGrid.select(param);
			}
		},

		/**
		 * 获取可用网络的index
		 * @return {number}
		 */
		detectAvailableNetworkIndex : function() {
			var i = _detectAvailableNetworkIndex();
			if (i == -1) {
				wizard.utils.dialog().show('warn',
						self.i18n.no_available_network);
				return false;
			}

			return i;
		},

		/**
		 * 解绑网络列表数据
		 */
		unbind : _networkGrid.unbind,

		getDataByIndex : _getDataByIndex,

		/**
		 * 获取选中行
		 */
		getSelectRows : _networkGrid.getSelectRows,

		/**
		 * 判断网络是否可选
		 * @return {boolean}
		 */
		canSelect : _canSelect,

		/**
		 * 判断网络是否加载完成
		 * @return {boolean}
		 */
		isLoaded : _networkGrid.isLoaded,

		/**
		 * 加载网络
		 */
		load : function() {
			_networkGrid.loadDS();
		},

		/**
		 * 是否需要自动加载网络，否则由whenLoad指定加载时机
		 * @return {boolean}
		 */
		needAutoLoaded : function() {
			return !options.whenLoad;
		},

		hideCell : function(colName) {
			BC.hideCell([colName], _networkGrid.getInstance());
		}
	}
};

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

/**
 * 选择数据中心step
 * @module  wizard.steps.datacenter
 */
wizard.steps.datacenter = {
	id : 'selectDatacenter',

	validate : function() {
		var self = this;
		return {
			validate : self.handle.validate(),
			showWarning : true,
			warningText : function() {
				return !self.handle.isLoaded()
						? self.i18n.datacenterIsLoading
						: self.i18n.selectDatacenterValidateInfo
			}
		}
	},

	handle : wizard.handlers.datacenter,

	i18n : {
		'zh_CN' : {
			title : '选择数据中心',
			titleText : '您属于多个数据中心，请选择在哪个数据中心申请负载均衡',
			datacenterIsLoading : "正在加载数据中心，请稍候",
			selectDatacenterValidateInfo : "请选择数据中心",
			datacenterHasBeenDeleted : "您申请的数据中心已不存在(您可能已经被管理员移出该数据中心)"
		},

		'en_US' : {
			title : 'Select Datacenter',
			titleText : 'You belong to multiple datacenters, please choose one.',
			datacenterIsLoading : "datacenter data is loading, please wait a moment",
			selectDatacenterValidateInfo : "Please select a datacenter",
			datacenterHasBeenDeleted : "The datacenter you applied is not existed"
		}
	},

	clear : function() {
		wizard.model.removeData(['dataCenterId', 'dataCenterName', 'dataCenterDesc']);
	}
};

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
/**
 * 新建wizard实例
 * @main wizard
 * @module wizard
 * 
 * @param {{locale :
 *            string, steps : Array.<step>, titleContainer : string, dataCenter :
 *            object}}
 * @return {wizard}
 */
wizard.init = function(userOptions) {
	return new wizard.init.prototype._Init(userOptions);
};

wizard.init.prototype = {
	constructor : wizard.init,

	/**
	 * wizard实际的构造函数，用于无new构造wizard实例
	 * 
	 * @constructor
	 * @param {}
	 *            userOptions
	 * @private
	 */
	_Init : function(userOptions) {

		var utils = wizard.utils,

		options = utils.mixin({
					locale : 'zh_CN',
					steps : [],
					titleContainer : '#stepTitle',
					dataCenter : {}
				}, userOptions);

		if (!options.titleContainer || !options.titleContainer.nodeType) {
			throw new Error('Init : titleContainer should be a DOM Object!')
		}

		// 保存step id和step对象的映射关系
		var steps = {},

		// 依赖的基础模块
		baseModules = {},

		// 文本国际化属性
		i18nAttributeName = 'data-i18n',

		// 步骤标题
		titles = [],

		// carousel
		carousel,

		// step bar
		stepBar,

		isStepBarInited = false,

		jQueryInstance = window['jQuery'],

		// 文本国际化
		i18n = function(step) {
			if (!step.i18n) {
				return;
			}

			var elements = utils.getElementsWithAttribute(carousel
							.getSlide(step.index)[0], i18nAttributeName), i18n = step.i18n, i18nName;

			for (var i = 0, len = elements.length; i < len; i++) {
				i18nName = elements[i].getAttribute(i18nAttributeName);

				if (!utils.trim(i18nName))
					continue;

				utils.trim(i18n[i18nName])
						&& utils.textContent(elements[i], i18n[i18nName]);
			}

			// grid国际化
			var gridI18n = step.i18n.grid, grid, view;
			if (gridI18n && gridI18n.gridId
					&& (grid = unieap.byId(gridI18n.gridId))) {
				view = grid.getManager('ViewManager');

				for (var i in gridI18n) {
					if (i === 'gridId')
						continue;
					view.setHeaderName(i, gridI18n[i]);
				}
			}
		},
		
		_addBaseModule = function(id, module) {
				var self = this;
				
				// 若module是函数，则进行初始化，如果是对象，直接存入baseModules
				if (utils.isFunction(module)) {
					// 基础模块间可以引用
					baseModules[id] = module.apply({
								getBaseModule : self.getBaseModule
							});
				} else if (utils.type(module) === 'object') {
					baseModules[id] = module;
				}
			},

		_addStep = function(id, step, options) {
			if (typeof id !== 'string' || utils.trim(id) === '') {
				throw new Error('addStep : Id of step should be a non-null string value!');
			}

			var self = this;
			// if (this.getStep(id)) {
			// return;
			// }

			// step内部可以调用base module api
			step.getBaseModule = this.getBaseModule;
			// 初始化Step的国际化对象
			step.i18n = step.i18n[locale];
			// Step标题
			titles.push(step.i18n.title || step.id);
			isStepBarInited
					&& stepBar.splice(titles.length - 1, 0,
							titles[titles.length - 1]);

			step.removeStep = function() {
				return self.removeStep(id);
			};

			if (utils.isFunction(step.handle)) {
				step.handle = step.handle(options || {});
			}

			// 国际化
			i18n(step);

			steps[id] = step;
		},

		findStep = function(index) {
			for (var i in steps) {
				if (steps[i].index == index)
					return steps[i];
			}
		};

		// initiate model
		wizard.model = wizard.model(options.model);

		/**
		 * 通过id获取底层模块
		 * 
		 * @param {string}
		 *            id
		 * @return {Object.<string, Object>} module
		 */
		this.getBaseModule = function(id) {
			if (typeof id !== 'string' || utils.trim(id) === '') {
				throw new Error('getBaseModule : Id of module should be a non-null string value!');
			}

			return baseModules[id];
		};

		/**
		 * 取step
		 * 
		 * @param {string}
		 *            id id of step
		 * @return {wizard.step}
		 */
		this.getStep = function(id) {
			if (utils.type(id) !== 'string' && utils.trim(id) !== '') {
				return null;
			}

			return steps[id];
		};

		/**
		 * 取step
		 * 
		 * @param {string}
		 *            id id of step
		 * @return {wizard.step}
		 */
		this.removeStep = function(id) {
			var step = this.getStep(id), index = step.index;
			if (!step)
				return;

			for (var i in steps) {
				steps[i].index > index && steps[i].index--;
			}

			// 移除导航节点
			stepBar.splice(index, 1);

			if (carousel.getIndex() === index) {
				options.titleContainer.textContent(titles[index] || '');
			}

			carousel.remove(index);
			
			//移除订阅
			wizard.pubSub.unSubscribe(id);

			return delete steps[id];
		};

		// 初始化carousel
		carousel = wizard.adapters.carousel({

					// 校验
					validate : function(e, p) {
						var validate = true, currentStep = findStep(p), validateObj;

						if (currentStep.validate) {
							validateObj = currentStep.validate();
							validate = validateObj.validate;

							!validate
									&& validateObj.showWarning
									&& utils.dialog().show('warn',
											validateObj.warningText);
						}

						return validate;
					},

					// 步骤移动前，切换标题，待改进
					beforeMove : function(e, p) {
						var $title,
						// 下个Step实例
						nextStepInst
						// 当前步骤实例
						currentStepInst;

						// 如果当前执行环境加载了jquery，调用其动画模块
						if (jQueryInstance) {
							$title = $(options.titleContainer);
							$.fn.customShow = function() {
								this.fadeIn({
											duration : 500,
											queue : false
										});
								return this;
							};

							$().is(":animated") && $title.stop();
							$title.hide().text(titles[p.i])[p.animate
									? 'customShow'
									: 'show']();
						} else {
							options.titleContainer.textContent(titles[p.i]);
						}

						nextStepInst = findStep(p.i), currentStepInst = findStep(p.i
								- 1);

						currentStepInst && currentStepInst.getInited()
								&& currentStepInst.end && currentStepInst.end();

						if (nextStepInst) {
							!nextStepInst.getInited()
									&& (nextStepInst.inited())
									&& nextStepInst.init && nextStepInst.init();

							nextStepInst.begin && nextStepInst.begin();
						}
					},

					// 移动后，切换导航条
					afterMove : function(e, p) {
						stepBar.getInstance().stepTo(p);
					}
				});

		// 初始化stepbar
		isStepBarInited = true;
		stepBar = wizard.adapters.stepBar({
					stepTitles : titles
				});

		// 添加底层模块
		this.addBaseModule({
					carousel : carousel,
					stepBar : stepBar
				});

		// 添加step
		this.addSteps(options.steps);
				
		// portal变化则重新route
		var self = this;
		wizard.pubSub.subscribe('portalChanged', 'global', function(portal) {
					self.route(portal);
				});

	},
	
	/**
	 * 添加底层模块
	 * 
	 * @param {{id :
	 *            string, module : (function|object)}}
	 *            module可以为包含模块api的对象，也可为模块的初始化函数，返回api对象
	 */
	addBaseModule : function(id, module) {
		var self = this, obj;

		if (arguments.length === 1) {
			if (utils.type(id) !== 'object'
					|| (typeof id === 'string' && utils.trim(id) === '')) {
				throw new Error('addBaseModules : wrong parameters');
			}

			obj = id;
			for (var i in obj) {
				if (obj.hasOwnProperty(i)) {
					// 同Id允许覆盖
					_addBaseModule(i, obj[i]);
				}
			}
		} else if (arguments.length === 2) {
			_addBaseModule(id, handler);
		} else {
			throw new Error('addBaseModules : wrong arguments');
		}
	},
	
	/**
	 * 添加step
	 * 
	 * @param {(Array.
	 *            <function> | Array.<{step : function, options : Object}>)}
	 *            function为step初始化函数, options为参数
	 */
	addSteps : function(steps) {
		var step;
		for (var i = 0, len = steps.length; i < len; ++i) {
			step = steps[i];

			if (utils.type(step) === 'object') {
				// 有参数
				if (utils.type(step.step) === 'object') {
					step.step = wizard.step(step.step);
					_addStep(step.step.id, step.step, step.options);
					// 无参数
				} else {
					step = wizard.step(step);
					_addStep(step.id, step);
				}

			}
		}
	},

	/**
	 * portal初始化
	 * 
	 * @param {string}
	 *            name of portal
	 */
	route : function(portal) {
		var carouselHandler = this.getBaseModule('carousel'), buttonHandler = this
				.getBaseModule('button');
		if (!carouselHandler)
			throw new Error('carouselHandler should be registered!');

		wizard.portal.initPortal(portal);
		wizard.pubSub.publish('route');
		buttonHandler && buttonHandler.switchBtn(portal);
	}
};

wizard.init.prototype._Init.prototype = wizard.init.prototype; 

