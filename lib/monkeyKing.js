'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _componentFactory = require('./componentFactory');

var _componentFactory2 = _interopRequireDefault(_componentFactory);

var _omit = require('omit.js');

var _omit2 = _interopRequireDefault(_omit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function metaToComponent(meta, props) {
    if ((typeof meta === 'undefined' ? 'undefined' : (0, _typeof3.default)(meta)) == 'object') {

        var propsFromMeta = {};

        (0, _keys2.default)(meta).forEach(function (key) {
            var v = meta[key],
                t = typeof v === 'undefined' ? 'undefined' : (0, _typeof3.default)(v);

            if (v instanceof Array) {
                propsFromMeta[key] = [];
                v.forEach(function (c) {
                    propsFromMeta[key].push(metaToComponent(c, props));
                });
            } else if (t == 'object') {
                propsFromMeta[key] = metaToComponent(v, props);
            } else {
                propsFromMeta[key] = v;
            }
        });

        if (meta.component) {
            var componentName = meta.component,
                component = _componentFactory2.default.getComponent(props.appName, componentName);

            var allProps = (0, _extends3.default)({}, props, propsFromMeta, {
                key: meta.path
            });

            allProps = (0, _omit2.default)(allProps, ['clearAppState', 'component', 'name', 'getDirectFuns', 'initView', 'payload']);

            if (allProps['_visible'] === false) return null;

            if (typeof component == 'string' || component.prototype.isReactComponent) {
                return _react2.default.createElement(component, allProps);
            } else {
                return component(allProps);
            }
        } else {
            return propsFromMeta;
        }
    } else {
        return meta;
    }
}

var MonkeyKing = function MonkeyKing(props) {
    var path = props.path,
        gm = props.gm;

    var component = metaToComponent(gm(path), props);
    return component;
};

exports.default = MonkeyKing;
module.exports = exports['default'];