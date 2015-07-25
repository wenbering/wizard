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
