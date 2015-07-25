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