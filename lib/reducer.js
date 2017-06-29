'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

exports.default = actionCreator;

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _util = require('./util');

var util = _interopRequireWildcard(_util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var reducer = function () {
	function reducer() {
		(0, _classCallCheck3.default)(this, reducer);
	}

	(0, _createClass3.default)(reducer, [{
		key: 'init',
		value: function init(state, option) {
			var _option$data = option.data,
			    data = _option$data === undefined ? {} : _option$data;


			return this.initByImmutable(state, {
				data: _immutable2.default.fromJS(data)
			});
		}
	}, {
		key: 'initByImmutable',
		value: function initByImmutable(state, option) {
			var data = option.data;

			//清除state中非@@开头的属性，那属性是xr-app-loader增加的

			var keys = [];
			state.mapKeys(function (key) {
				if (key.indexOf('@@') === -1) keys.push(key);
			});

			keys.forEach(function (key) {
				state = state.remove(key);
			}

			//设置状态
			);return state.set('data', data);
		}
	}, {
		key: 'onEvent',
		value: function onEvent(eventName, option) {
			var path = option.path;


			switch (eventName) {
				case 'onFieldFocus':
					return focus(state, path);
				case 'onFieldChange':
					return util.setter(state, path, 'value', option.value);
				default:
					return state;
			}
		}
	}, {
		key: 'focus',
		value: function focus(state, path) {
			return util.setter(state, 'meta', 'focusField', path);
		}
	}]);
	return reducer;
}();

function actionCreator() {
	var o = new reducer();
	return {
		init: o.init,
		initByImmutable: o.initByImmutable,
		getMeta: util.get,
		getField: util.getField,
		setMeta: util.set,
		setField: util.setField,
		onEvent: o.onEvent,
		gm: util.get,
		gf: util.getField,
		sm: util.setMeta,
		sf: util.setField
	};
}
module.exports = exports['default'];