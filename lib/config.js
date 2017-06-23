'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = config;

var _xrAppLoader = require('xr-app-loader');

var _componentFactory = require('./componentFactory');

var _componentFactory2 = _interopRequireDefault(_componentFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function config(option) {
	var apps = option.apps,
	    components = option.components;


	_componentFactory2.default.registerComponents(components);
	(0, _xrAppLoader.config)({ apps: apps });
}
module.exports = exports['default'];