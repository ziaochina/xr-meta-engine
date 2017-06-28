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

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

exports.default = actionCreator;

var _util = require('./util');

var util = _interopRequireWildcard(_util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var action = function () {
	function action(option) {
		(0, _classCallCheck3.default)(this, action);

		this.appName = option.appInfo.name;
		this.event = option.event;
		this.realAction = option.exps;

		this.initView = this.initView.bind(this);
		this.getterByField = this.getterByField.bind(this);
		this.getter = this.getter.bind(this);
		this.asyncGetter = this.asyncGetter.bind(this);
		this.onEvent = this.onEvent.bind(this);
		this.getDirectFuns = this.getDirectFuns.bind(this);
	}

	(0, _createClass3.default)(action, [{
		key: 'initView',
		value: function initView(component, injections) {
			this.component = component;
			this.injections = injections;

			this.event.root && this.event.root.onInit && this.event.root.onInit({
				component: component,
				injections: injections
			});
		}
	}, {
		key: 'getterByField',
		value: function getterByField(fieldPath) {
			return util.getterByField(this.injections.getState(), fieldPath);
		}
	}, {
		key: 'getter',
		value: function getter(path, propertys) {
			var ret = util.getter(this.injections.getState(), path, propertys),
			    parsedPath = util.parsePath(path),
			    eventSource = (parsedPath || {
				path: 'root'
			}).path;

			if (!propertys) {
				return ret;
			}

			if (typeof propertys === 'string') {
				if (this.event && this.event[eventSource] && this.event[eventSource][propertys]) {
					ret = this.event[eventSource][propertys]({
						path: eventSource,
						rowIndex: parsedPath.vars ? parsedPath.vars[0] : undefined
					});
				}
				return ret;
			}

			if (propertys.constructor === Array) {
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = (0, _getIterator3.default)(propertys), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var pt = _step.value;

						if (this.event && this.event[eventSource] && this.event[eventSource][pt]) {
							ret = ret.set(pt, this.event[eventSource][pt]({
								path: eventSource,
								rowIndex: parsedPath.vars ? parsedPath.vars[0] : undefined
							}));
						}
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
			}
			return ret;
		}
	}, {
		key: 'asyncGetter',
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

			function asyncGetter(_x, _x2) {
				return _ref.apply(this, arguments);
			}

			return asyncGetter;
		}()
	}, {
		key: 'onEvent',
		value: function onEvent(eventName, option) {
			var parsedPath = _a.parsePath(option.path),
			    eventSource = (parsedPath || {
				path: 'root'
			}).path;

			if (this.event && this.event[eventSource] && this.event[eventSource][eventName]) {
				this.event[eventSource][eventName]((0, _extends3.default)({}, option, {
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
			var _this = this;

			return {
				getter: function getter(path, propertys) {
					return _this.realAction.getter(path, propertys);
				},
				getterByField: function getterByField(fieldPath) {
					return _this.realAction.getterByField(fieldPath);
				},
				asyncGetter: function () {
					var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(path, propertys) {
						return _regenerator2.default.wrap(function _callee2$(_context2) {
							while (1) {
								switch (_context2.prev = _context2.next) {
									case 0:
										_context2.next = 2;
										return _this.realAction.asyncGetter(path, property);

									case 2:
										return _context2.abrupt('return', _context2.sent);

									case 3:
									case 'end':
										return _context2.stop();
								}
							}
						}, _callee2, _this);
					}));

					return function asyncGetter(_x3, _x4) {
						return _ref2.apply(this, arguments);
					};
				}(),
				g: function g(path, propertys) {
					return _this.realAction.getter(path, propertys);
				},
				gf: function gf(fieldPath) {
					return _this.realAction.getterByField(fieldPath);
				},
				ag: function () {
					var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(path, propertys) {
						return _regenerator2.default.wrap(function _callee3$(_context3) {
							while (1) {
								switch (_context3.prev = _context3.next) {
									case 0:
										_context3.next = 2;
										return _this.realAction.asyncGetter(path, property);

									case 2:
										return _context3.abrupt('return', _context3.sent);

									case 3:
									case 'end':
										return _context3.stop();
								}
							}
						}, _callee3, _this);
					}));

					return function ag(_x5, _x6) {
						return _ref3.apply(this, arguments);
					};
				}()
			};
		}
	}]);
	return action;
}();

function actionCreator(option) {
	var o = new action(option);
	return {
		g: o.getter,
		gf: o.getterByField,
		initView: o.initView,
		getter: o.getter,
		asyncGetter: o.asyncGetter,
		getterByField: o.getterByField,
		onEvent: o.onEvent,
		getDirectFuns: o.getDirectFuns
	};
}
module.exports = exports['default'];