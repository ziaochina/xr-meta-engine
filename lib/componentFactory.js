'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var componentFactory = function () {
    function componentFactory() {
        (0, _classCallCheck3.default)(this, componentFactory);

        this.componentsById = {};
        this.defaultComponents = {};
    }

    (0, _createClass3.default)(componentFactory, [{
        key: 'registerComponent',
        value: function registerComponent(id, component) {
            this.componentsById[id] = component;
        }
    }, {
        key: 'registerComponents',
        value: function registerComponents(components) {
            this.componentsById = (0, _extends3.default)({}, this.componentsById, components);
        }
    }, {
        key: 'getComponent',
        value: function getComponent(id) {
            var component = this.componentsById[id];

            if (!component) {
                throw '\u6CA1\u6709\u7EC4\u4EF6. Id: ' + id;
            }
            return this.componentsById[id];
        }
    }, {
        key: 'getComponents',
        value: function getComponents() {
            return this.componentsById;
        }
    }, {
        key: 'getDefaultComponent',
        value: function getDefaultComponent(type) {
            if (!type) {
                throw 'type没有值';
            }

            if (this.defaultComponents[type]) return this.getComponent(this.defaultComponents[type]);

            throw new Error('\u6CA1\u6709\u7EC4\u4EF6. Type: ' + type);
        }
    }, {
        key: 'setDefaultComponents',
        value: function setDefaultComponents(components) {
            this.defaultComponents = components;
        }
    }]);
    return componentFactory;
}();

exports.default = new componentFactory();
module.exports = exports['default'];