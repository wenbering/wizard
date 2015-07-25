/**
 * grid 过滤功能
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
		 * 解析grid数据，并自动为为所有过滤combobox绑定数据
		 * @param {DataStore} ds 数据
		 * @param {string} ID 数据
		 */
		bind : function(ds, relevanceId) {
			_bindFilter(_filterDSCollection[relevanceId]
					|| _generateFilterDS(ds, relevanceId));
		},

		/**
		 * 解绑
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