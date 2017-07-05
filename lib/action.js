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

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

exports.default = creator;

var _util = require('./util');

var util = _interopRequireWildcard(_util);

var _immutable = require('immutable');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var action = function action(option) {
	(0, _classCallCheck3.default)(this, action);

	_initialiseProps.call(this);

	this.appInfo = option.appInfo;
	this.meta = (0, _immutable.fromJS)(option.appInfo.meta);
	this.cache = {};

	util.setMeta(option.appInfo);
};

var _initialiseProps = function _initialiseProps() {
	var _this = this;

	this.setMetaHandlers = function (metaHandlers) {
		_this.metaHandlers = metaHandlers;
	};

	this.initView = function (component, injections) {
		_this.component = component;
		_this.injections = injections;

		_this.metaHandlers && _this.metaHandlers['onInit'] && _this.metaHandlers['onInit']({ component: component, injections: injections });
	};

	this.getField = function (fieldPath) {
		return util.getField(_this.injections.getState(), fieldPath);
	};

	this.setField = function (fieldPath, value) {
		return _this.injections.reduce('setField', fieldPath, value);
	};

	this.parseExpreesion = function (v) {
		var reg = new RegExp(/\{\{([^{}]+)\}\}/);

		if (!_this.cache.expression) _this.cache.expression = {};

		if (_this.cache.expression[v]) {
			return _this.cache.expression[v];
		}

		if (!_this.cache.expressionParams) {
			_this.cache.expressionParams = ['data'].concat((0, _keys2.default)(_this.metaHandlers).map(function (k) {
				return "$" + k;
			})).concat(['_path', '_rowIndex', '_vars']);
		}

		var params = _this.cache.expressionParams;

		var body = "return " + v.replace(reg, function (word, group) {
			return group;
		}).replace(/\([ ]*\)/g, function (word) {
			return '({path:_path, rowIndex:_rowIndex, vars: _vars})';
		});

		_this.cache.expression[v] = new (Function.prototype.bind.apply(Function, [null].concat((0, _toConsumableArray3.default)(params), [body])))();

		return _this.cache.expression[v];
	};

	this.updateChildrenMeta = function (childrenMeta, parentPath, rowIndex, vars, data) {
		if (!childrenMeta || childrenMeta.size == 0) return;

		if (typeof childrenMeta === 'string') return;

		childrenMeta.map(function (child) {
			_this.updateMeta(child, parentPath + '.' + child.name, rowIndex, vars, data);
		});
	};

	this.updateMeta = function (meta, path, rowIndex, vars, data) {
		var reg = new RegExp(/\{\{([^{}]+)\}\}/);

		(0, _keys2.default)(meta).forEach(function (key) {
			var v = meta[key],
			    t = typeof v === 'undefined' ? 'undefined' : (0, _typeof3.default)(v);

			if (key === 'children') {
				_this.updateChildrenMeta(meta[key], path, rowIndex, vars, data);
			} else if (t == 'string' && reg.test(v)) {

				var f = _this.parseExpreesion(v);

				var values = [data];

				(0, _keys2.default)(_this.metaHandlers).forEach(function (k) {
					values.push(_this.metaHandlers[k]);
				});

				values = values.concat([path, rowIndex, vars]);
				meta[key] = f.apply(_this, values);
			}
			/*
   			else if(t == 'string' && v.length > 2){
   				
   			
   				//$$ action function
   				if(v.substring(0,2) == '$$'){
   
   					let handlerName = meta[key].substr(2)
   
   					if(!this.metaHandlers || !this.metaHandlers[handlerName] )
   						throw `not found ${v} handler, please define in action`
   					
   					meta[key] = (...args)=> {
   						this.metaHandlers[handlerName]({...args, path, rowIndex, vars})
   					}
   
   					meta[key] = meta[key].bind(this)
   				}
   
   				//$= exec action function
   				else if(v.substring(0,2) == '$='){
   					let handlerName = meta[key].substr(2)
   
   					if(!this.metaHandlers || !this.metaHandlers[handlerName] )
   						throw `not found ${v} handler, please define in action`
   
   					meta[key] = this.metaHandlers[handlerName]({path, rowIndex, vars})
   				}
   
   				//%= state field value
   				else if(v.substring(0,2) == '%='){
   					meta[key] = this.getField(this.calcBindField(v.substr(2), vars))
   				}
   
   				//event argument -> state field
   				else if(v.indexOf('->') != -1){
   
   					const tmp = meta[key].replace('->', ';').split(';')
   					const f = new Function('args', 'fieldPath', 'setField', `setField(fieldPath, ${tmp[0]})`).bind(this)
   					
   					meta[key] = (...args) => {
   						f(args, this.calcBindField(tmp[1], vars),  this.setField)
   					}
   
   					meta[key] = meta[key].bind(this)
   				}
   			}
   */

			else if (t == 'object' && v.component) {
					_this.updateMeta(meta[key], path + '.' + key, rowIndex, vars, data);
				}
		});
	};

	this.calcBindField = function (bindField, vars) {
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
	};

	this.getMeta = function (fullPath, propertys) {
		var meta = util.getMeta(_this.appInfo, fullPath, propertys),
		    parsedPath = util.parsePath(fullPath),
		    path = parsedPath.path,
		    rowIndex = parsedPath.vars ? parsedPath.vars[0] : undefined,
		    vars = parsedPath.vars,
		    data = util.getField(_this.injections.getState()).toJS();

		_this.updateMeta(meta, path, rowIndex, vars, data);
		return meta;
	};

	this.asyncGet = function () {
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

							if (!(_this.event && _this.event[eventSource] && _this.event[eventSource][propertys])) {
								_context.next = 7;
								break;
							}

							_context.next = 5;
							return _this.event[eventSource][propertys]({
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
			}, _callee, _this);
		}));

		return function (_x, _x2) {
			return _ref.apply(this, arguments);
		};
	}();

	this.onEvent = function (eventName, option) {
		var parsedPath = util.parsePath(option.path),
		    eventSource = (parsedPath || {
			path: 'root'
		}).path;

		var strHandler = util.getMeta(_this.appInfo, eventSource, eventName);
		if (strHandler && strHandler.substring(0, 2) === '$$' && _this.metaHandlers[strHandler.substr(2)]) {
			_this.metaHandlers[strHandler.substr(2)]((0, _extends3.default)({}, option, {
				path: eventSource,
				rowIndex: parsedPath.vars ? parsedPath.vars[0] : option.rowIndex
			}));
		} else {
			_this.injections.reduce('onEvent', eventName, option);
		}
	};

	this.getDirectFuns = function () {
		return {
			getMeta: function getMeta(path, propertys) {
				return _this.getMeta(path, propertys);
			},
			getField: function getField(fieldPath) {
				return _this.getField(fieldPath);
			},
			asyncGet: function () {
				var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(path, propertys) {
					return _regenerator2.default.wrap(function _callee2$(_context2) {
						while (1) {
							switch (_context2.prev = _context2.next) {
								case 0:
									_context2.next = 2;
									return _this.asyncGet(path, property);

								case 2:
									return _context2.abrupt('return', _context2.sent);

								case 3:
								case 'end':
									return _context2.stop();
							}
						}
					}, _callee2, _this);
				}));

				return function asyncGet(_x3, _x4) {
					return _ref2.apply(this, arguments);
				};
			}(),
			gm: function gm(path, propertys) {
				return _this.getMeta(path, propertys);
			},
			gf: function gf(fieldPath) {
				return _this.getField(fieldPath);
			},
			ag: function () {
				var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(path, propertys) {
					return _regenerator2.default.wrap(function _callee3$(_context3) {
						while (1) {
							switch (_context3.prev = _context3.next) {
								case 0:
									_context3.next = 2;
									return _this.asyncGet(path, property);

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
	};

	this.gm = this.getMeta;
	this.gf = this.getField;
};

function creator(option) {
	return new action(option);
}
module.exports = exports['default'];