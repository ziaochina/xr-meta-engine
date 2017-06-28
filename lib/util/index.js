'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.get = get;
exports.setMetaProperty = setMetaProperty;
exports.set = set;
exports.update = update;
exports.getField = getField;
exports.setField = setField;
exports.updateField = updateField;
exports.parseMeta = parseMeta;

var _immutable = require('immutable');

var _path = require('./path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function get(state, path, propertys) {
    if (propertys === 'focusField') return state.getIn(['meta_runtime', 'focusField']);

    if (!path) return undefined;

    var parsedPath = (0, _path.parsePath)(path),
        vars = parsedPath.vars,
        sourcePath = path,
        meta,
        value,
        bindField;

    path = state.getIn(['parsedMeta', parsedPath.path]);

    var getMeta = function getMeta() {
        if (meta) {
            return meta;
        }

        meta = state.getIn(path.split('.'));
        bindField = meta.get('bindField');
        if (vars) {
            bindField = (0, _path.calcBindField)(bindField, parsedPath);
            meta = meta.merge(state.getIn(('data.' + bindField + '_runtime').split('.')));
        }
        return meta;
    };

    var getBindField = function getBindField() {
        if (bindField) return bindField;
        getMeta(path);
        return bindField;
    };

    var getPropertyValue = function getPropertyValue(property) {
        if (!property) return getMeta();

        if (property === 'isFocus') return state.getIn(['other', 'focusField']) === sourcePath;

        if (property === 'bindField') return getBindField();

        if (property === 'value') {
            return state.getIn(('data.' + getBindField()).split('.'));
        }

        return getMeta().getIn(property.split('.'));
    };

    var ret = undefined;
    if (propertys instanceof Array) {
        ret = (0, _immutable.Map)();
        propertys.forEach(function (p) {
            ret = ret.set(p, getPropertyValue(p));
        });
    } else {
        ret = getPropertyValue(propertys);
    }

    return ret;
}

function setMetaProperty(meta, propertyPath, value) {
    if (!meta || !propertyPath) return meta;

    var pathSegments = propertyPath.split('.'),
        property = void 0,
        current = void 0;

    pathSegments.every(function (p, index) {
        if (index == 0 && meta.name != p) return false;

        if (index == 0) {
            current = meta;
            return true;
        }

        if (index == pathSegments.length - 1) {
            current[p] = value;
            return false;
        }

        if (!current.childrens || current.childrens.length == 0) return false;

        return !current.childrens.every(function (c, index) {
            if (c.name == p) {
                current = c;
                return false;
            }
            return true;
        });
    });

    return meta;
}

function set(state, path, property, value) {
    if (!path || !property) return state;

    if (property === 'focusField') {
        value = value || '';
        state = state.setIn(['other', 'oldFocusField'], state.getIn(['other', 'focusField']));
        return state.setIn(['other', 'focusField'], value);
    }

    var parsedPath = (0, _path.parsePath)(path),
        bindField = void 0;
    path = state.getIn(['parsedMeta', parsedPath.path]);

    if (property === 'value') {
        bindField = state.getIn((path + '.bindField').split('.'));
        bindField = (0, _path.calcBindField)(bindField, parsedPath);
        state = state.setIn(('data.' + bindField).split('.'), value);
        return state;
    }

    if (!parsedPath.vars) {
        return state.setIn((path + '.' + property).split('.'), value);
    }

    bindField = state.getIn((path + '.bindField').split('.'));
    bindField = (0, _path.calcBindField)(bindField, parsedPath);
    return state.setIn(('data.' + bindField + '_runtime.' + property).split('.'), value);
}

function update(state, path, property, fn) {
    if (property !== 'value') return;
    var parsedPath = (0, _path.parsePath)(path),
        bindField = void 0;
    path = state.getIn(['parsedMeta', parsedPath.path]);
    bindField = state.getIn((path + '.bindField').split('.'));
    bindField = (0, _path.calcBindField)(bindField, parsedPath);
    return state.updateIn(('data.' + bindField).split('.'), fn);
}

function getField(state, fieldPath) {
    if (!fieldPath) {
        return state.get('data');
    }

    if (fieldPath instanceof Array) {
        return state.getIn(['data'].concat(fieldPath));
    } else {
        return state.getIn(('data.' + fieldPath).split('.'));
    }
}

function setField(state, fieldPath, value) {
    if (fieldPath instanceof Array) {
        return state.setIn(['data'].concat(fieldPath), value);
    } else {
        return state.setIn(('data.' + fieldPath).split('.'), value);
    }
}

function updateField(state, fieldPath, fn) {
    if (fieldPath instanceof Array) {
        return state.updateIn(['data'].concat(fieldPath), fn);
    } else {
        return state.updateIn(('data.' + fieldPath).split('.'), fn);
    }
}

function parseMeta(meta) {
    var ret = (0, _immutable.Map)(),
        name = meta.get('name');

    ret = ret.set(name, 'meta');

    var parseChildren = function parseChildren(children, parentPath, parentRealPath) {
        if (!children) return;
        children.forEach(function (child, index) {
            if (typeof child != 'string') {
                var childName = child.get('name'),
                    path = parentPath + '.' + childName,
                    realPath = parentRealPath + '.children.' + index;
                ret = ret.set(path, realPath);
                parseChildren(children.get('children'), path, realPath);
            }
        });
    };
    parseChildren(meta.get('children'), name, 'meta');
    return ret;
}

(0, _assign2.default)(exports, (0, _extends3.default)({
    existsParamsInPath: _path.existsParamsInPath,
    parsePath: _path.parsePath,
    calcBindField: _path.calcBindField,
    match: _path.match
}, exports));