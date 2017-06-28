"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var componentFactory = function () {
    function componentFactory() {
        (0, _classCallCheck3.default)(this, componentFactory);

        this.components = {};
        this.appComponents = {};
    }

    (0, _createClass3.default)(componentFactory, [{
        key: "registerComponent",
        value: function registerComponent(name, component) {
            if (this.components[name]) {
                throw "\u7EC4\u4EF6existed. name: " + name;
            }
            this.components[name] = component;
        }
    }, {
        key: "registerAppComponent",
        value: function registerAppComponent(appName, componentName, component) {
            this.appComponents[appName] = this.appComponents[appName] || {};
            this.appComponents[appName].components = this.appComponents[appName].components || {};
            if (this.appComponents[appName].components[componentName]) throw "\u7EC4\u4EF6existed. app:" + appName + ", name: " + componentName;
            this.appComponents[appName].components[componentName] = component;
        }
    }, {
        key: "registerComponents",
        value: function registerComponents(components) {
            var _this = this;

            if (!components || components.length == 0) return;
            components.forEach(function (c) {
                return _this.registerComponent(c.name, c.component);
            });
        }
    }, {
        key: "getComponent",
        value: function getComponent(appName, name) {
            if (this.appComponents && this.appComponents[appName] && this.appComponents[appName].components && this.appComponents[appName].components[name]) return this.appComponents[appName].components[name];

            var component = this.components[name];

            if (!component) {
                throw "\u6CA1\u6709\u7EC4\u4EF6. name: " + name;
            }

            return component;
        }
    }]);
    return componentFactory;
}();

var instance = new componentFactory();

exports.default = instance;
module.exports = exports["default"];