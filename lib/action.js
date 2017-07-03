'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

exports.default = creator;

var _util = require('./util');

var util = _interopRequireWildcard(_util);

var _immutable = require('immutable');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var action = function () {
	function action(option) {
		(0, _classCallCheck3.default)(this, action);

		this.appInfo = option.appInfo;
		this.appName = option.appInfo.name;
		this.meta = (0, _immutable.fromJS)(option.appInfo.meta);
		this.metaMap = util.parseMeta(this.meta);
		this.metaHandlers = option.metaHandlers;

		util.setMeta(option.appInfo);

		this.initView = this.initView.bind(this);
		this.getField = this.getField.bind(this);
		this.getMeta = this.getMeta.bind(this);
		this.asyncGet = this.asyncGet.bind(this);
		this.onEvent = this.onEvent.bind(this);
		this.getDirectFuns = this.getDirectFuns.bind(this);
	}

	(0, _createClass3.default)(action, [{
		key: 'initView',
		value: function initView(component, injections) {
			this.component = component;
			this.injections = injections;

			this.metaHandlers && this.metaHandlers['onInit'] && this.metaHandlers['onInit']({ component: component, injections: injections });
		}
	}, {
		key: 'getField',
		value: function getField(fieldPath) {
			return util.getField(this.injections.getState(), fieldPath);
		}
	}, {
		key: 'setField',
		value: function setField(fieldPath, value) {
			return this.injections.reduce('setField', fieldPath, value);
		}
	}, {
		key: 'updateChildrenMeta',
		value: function updateChildrenMeta(childrenMeta, parentPath, rowIndex, vars) {
			var _this = this;

			if (!childrenMeta || childrenMeta.size == 0) return;

			if (typeof childrenMeta === 'string') return;

			childrenMeta.map(function (child) {
				_this.updateMeta(child, parentPath + '.' + child.name, rowIndex, vars);
			});
		}
	}, {
		key: 'updateMeta',
		value: function (_updateMeta) {
			function updateMeta(_x, _x2, _x3, _x4) {
				return _updateMeta.apply(this, arguments);
			}

			updateMeta.toString = function () {
				return _updateMeta.toString();
			};

			return updateMeta;
		}(function (meta, path, rowIndex, vars) {
			var _this2 = this;

			(0, _keys2.default)(meta).forEach(function (key) {
				//$$getVisible
				if (typeof meta[key] == 'string' && meta[key].substring(0, 2) === '$$') {
					if (!_this2.metaHandlers || !_this2.metaHandlers[meta[key].substring(2)]) throw 'not found ' + meta[key] + ' handler, please define in action';

					var handlerName = meta[key].substr(2);
					meta[key] = function () {
						return _this2.metaHandlers[handlerName]({ path: path, rowIndex: rowIndex, vars: vars });
					};
				}

				//##form.code
				if (typeof meta[key] == 'string' && meta[key].substring(0, 2) === '##') {
					meta[key] = _this2.getField(calcBindField(meta[key].substr(2), vars));
				}

				//args[0].target.value->form.code
				if (typeof meta[key] == 'string' && meta[key].indexOf('->') !== -1) {
					var tmp = meta[key].replace('->', ';').split(';');
					var f = new Function('args', 'fieldPath', 'valueExpress', 'setField', 'setField(fieldPath, valueExpress)');
					meta[key] = function () {
						for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
							args[_key] = arguments[_key];
						}

						return f(args, _this2.calcBindField(tmp[1], vars), tmp[0], _this2.setField);
					};
				}

				if ((0, _typeof3.default)(meta[key]) == 'object' && meta[key].component) {
					updateMeta(meta[key], parent + '.' + key, rowIndex, vars);
				}

				if (key === 'children') _this2.updateChildrenMeta(meta[key], path, rowIndex, vars);

				if (key === 'bindField') {
					meta.value = _this2.getField(meta[key]);
				}
			});
		})
	}, {
		key: 'calcBindField',
		value: function calcBindField(bindField, vars) {
			if (!bindField) return bindField;

			if (!vars) return bindField;

			var hit = false;

			//root.detail.code,0;form.detail.${0}.code => form.detail.0.code
			//root.detail,0;form.detail => form.detail.0
			bindField = bindField.replace(/{(\d+)}/g, function (match, index) {
				hit = true;
				return vars[index];
			});
			return hit ? bindField : bindField + '.' + vars[0];
		}
	}, {
		key: 'getMeta',
		value: function getMeta(fullPath, propertys) {
			var meta = util.getMeta(this.appInfo, fullPath, propertys),
			    parsedPath = util.parsePath(fullPath),
			    path = parsedPath.path,
			    rowIndex = parsedPath.vars ? parsedPath.vars[0] : undefined,
			    vars = parsedPath.vars;

			this.updateMeta(meta, path, rowIndex, vars);
			return meta;
		}
	}, {
		key: 'asyncGet',
		value: function () {
			var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(path, property) {
				var parsedPath, eventSource, response;
				return _regenerator2.default.wrap(function _callee$(_context) {
					while (1) {
						switch (_context.prev = _context.next) {
							case 0:
								parsedPath = util.parsePath(path), eventSource = (parsedPath || {
									path: 'root'
								}).path;

								if (!(typeof property === 'string')) {
									_context.next = 7;
									break;
								}

								if (!(this.event && this.event[eventSource] && this.event[eventSource][propertys])) {
									_context.next = 7;
									break;
								}

								_context.next = 5;
								return this.event[eventSource][propertys]({
									path: eventSource,
									rowIndex: parsedPath.vars ? parsedPath.vars[0] : undefined
								});

							case 5:
								response = _context.sent;
								return _context.abrupt('return', _promise2.default.resolve(response));

							case 7:
							case 'end':
								return _context.stop();
						}
					}
				}, _callee, this);
			}));

			function asyncGet(_x5, _x6) {
				return _ref.apply(this, arguments);
			}

			return asyncGet;
		}()
	}, {
		key: 'onEvent',
		value: function onEvent(eventName, option) {
			var parsedPath = util.parsePath(option.path),
			    eventSource = (parsedPath || {
				path: 'root'
			}).path;

			var strHandler = util.getMeta(this.appInfo, eventSource, eventName);
			if (strHandler && strHandler.substring(0, 2) === '$$' && this.metaHandlers[strHandler.substr(2)]) {
				this.metaHandlers[strHandler.substr(2)]((0, _extends3.default)({}, option, {
					path: eventSource,
					rowIndex: parsedPath.vars ? parsedPath.vars[0] : option.rowIndex
				}));
			} else {
				this.injections.reduce('onEvent', eventName, option);
			}
		}
	}, {
		key: 'getDirectFuns',
		value: function getDirectFuns() {
			var _this3 = this;

			return {
				getMeta: function getMeta(path, propertys) {
					return _this3.getMeta(path, propertys);
				},
				getField: function getField(fieldPath) {
					return _this3.getField(fieldPath);
				},
				asyncGet: function () {
					var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(path, propertys) {
						return _regenerator2.default.wrap(function _callee2$(_context2) {
							while (1) {
								switch (_context2.prev = _context2.next) {
									case 0:
										_context2.next = 2;
										return _this3.asyncGet(path, property);

									case 2:
										return _context2.abrupt('return', _context2.sent);

									case 3:
									case 'end':
										return _context2.stop();
								}
							}
						}, _callee2, _this3);
					}));

					return function asyncGet(_x7, _x8) {
						return _ref2.apply(this, arguments);
					};
				}(),
				gm: function gm(path, propertys) {
					return _this3.getMeta(path, propertys);
				},
				gf: function gf(fieldPath) {
					return _this3.getField(fieldPath);
				},
				ag: function () {
					var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(path, propertys) {
						return _regenerator2.default.wrap(function _callee3$(_context3) {
							while (1) {
								switch (_context3.prev = _context3.next) {
									case 0:
										_context3.next = 2;
										return _this3.asyncGet(path, property);

									case 2:
										return _context3.abrupt('return', _context3.sent);

									case 3:
									case 'end':
										return _context3.stop();
								}
							}
						}, _callee3, _this3);
					}));

					return function ag(_x9, _x10) {
						return _ref3.apply(this, arguments);
					};
				}()
			};
		}
	}, {
		key: 'getPublishMethods',
		value: function getPublishMethods() {
			return {
				initView: this.initView,
				getMeta: this.getMeta,
				asyncGet: this.asyncGet,
				getField: this.getField,
				onEvent: this.onEvent,
				getDirectFuns: this.getDirectFuns,
				gm: this.getMeta,
				gf: this.getField
			};
		}
	}]);
	return action;
}();

function creator(option) {
	return new action(option).getPublishMethods();
}
module.exports = exports['default'];