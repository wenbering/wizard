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

