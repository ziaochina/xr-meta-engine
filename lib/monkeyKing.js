'use strict';

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _comonentFactory = require('./comonentFactory');

var _comonentFactory2 = _interopRequireDefault(_comonentFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getComponent(fieldType, componentName) {
    if (componentName) {
        return _comonentFactory2.default.getComponent(componentName);
    } else return _comonentFactory2.default.getDefaultComponent(fieldType);
}

var MonkeyKing = function MonkeyKing(props) {
    var path = props.path,
        g = props.g,
        ps = g(path, ['type', 'component']),
        fieldType = ps.get('type'),
        componentName = ps.get('component');


    var Component = getComponent(fieldType, componentName);

    if (_react2.default.Component.isPrototypeOf(Component)) {
        return _react2.default.createElement(Component, (0, _extends3.default)({}, props, {
            key: path
        }));
    } else {
        return Component((0, _extends3.default)({}, props, {
            key: path
        }));
    }
};