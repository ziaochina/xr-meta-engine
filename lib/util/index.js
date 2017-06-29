'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.getMeta = getMeta;
exports.setMeta = setMeta;
exports.getField = getField;
exports.setField = setField;
exports.updateField = updateField;
exports.parseMeta = parseMeta;

var _immutable = require('immutable');

var _path2 = require('./path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cache4Meta = (0, _immutable.Map)();

function getMeta(appInfo, fullpath, propertys) {
    if (!fullpath) return cache4Meta.getIn([appInfo.name, 'meta']).toJS();

    var parsedPath = (0, _path2.parsePath)(fullpath),
        vars = parsedPath.vars,
        metaMap = cache4Meta.getIn([appInfo.name, 'metaMap']),
        meta = cache4Meta.getIn([appInfo.name, 'meta']);

    path = metaMap.get(parsedPath.path);

    var currentMeta = meta.getIn(path.split('.'));

    if (!propertys) return currentMeta.toJS();

    var ret = {};

    if (propertys instanceof Array) {
        propertys.forEach(function (p) {
            var val = currentMeta.getIn(p.split('.'));
            ret[p] = val.toJS ? val.toJS() : val;
        });
    } else {
        var val = currentMeta.getIn(propertys.split('.'));
        ret[propertys] = val.toJS ? val.toJS() : val;
    }

    return ret;
}

function setMeta(appInfo) {
    if (!appInfo || !appInfo.meta) return;

    var appName = appInfo.name;

    if (cache4Meta.has(appName)) return;

    var meta = (0, _immutable.fromJS)(appInfo.meta),
        cache4Meta = cache4Meta.setIn([appName, 'meta'], meta).setIn([appName, 'metaMap', parsedMeta(meta)]);
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
                    _path = parentPath + '.' + childName,
                    realPath = parentRealPath + '.children.' + index;
                ret = ret.set(_path, realPath);
                parseChildren(children.get('children'), _path, realPath);
            }
        });
    };
    parseChildren(meta.get('children'), name, 'meta');
    return ret;
}

(0, _assign2.default)(exports, (0, _extends3.default)({
    existsParamsInPath: _path2.existsParamsInPath,
    parsePath: _path2.parsePath,
    calcBindField: _path2.calcBindField,
    match: _path2.match
}, exports));