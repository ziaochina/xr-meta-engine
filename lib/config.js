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
	var components = option.components;


	(0, _xrAppLoader.config)(option);

	if (!components || components.length == 0) return;

	components.forEach(function (c) {
		if (c.appName) _componentFactory2.default.registerComponent(c.appName, c.name, c.component);else _componentFactory2.default.registerComponent(c.name, c.component);
	});
}
module.exports = exports['default'];