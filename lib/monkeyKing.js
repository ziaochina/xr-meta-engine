'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _componentFactory = require('./componentFactory');

var _componentFactory2 = _interopRequireDefault(_componentFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getComponent(path, meta, props) {
    if (typeof meta == 'string') return meta;

    var componentName = meta.component;

    if (!componentName) {
        return;
    }

    var component = _componentFactory2.default.getComponent(props.appName, componentName);

    var childrenProp = meta.children;

    if (typeof meta.children != 'string') {
        childrenProp = getChildrenProp(path, meta.children, props);
    }

    var allProps = (0, _extends3.default)({}, props, meta, {
        children: childrenProp,
        path: path,
        key: path
    });

    if (_react2.default.Component.isPrototypeOf(component) || component.__propo__.name == 'ReactComponent') {
        return _react2.default.createElement(component, allProps);
    } else {
        return component(allProps);
    }
}

function getChildrenProp(parentPath, childrenMeta, props) {
    if (!childrenMeta || childrenMeta.length == 0) return;

    var ret = [];
    childrenMeta.forEach(function (c) {
        ret.push(getComponent(parentPath + '.' + c.name, c, props));
    });

    return ret;
}

var MonkeyKing = function MonkeyKing(props) {
    var path = props.path,
        gm = props.gm;

    return getComponent(path, gm(path), props);
};

exports.default = MonkeyKing;
module.exports = exports['default'];