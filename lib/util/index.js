'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

exports.getter = getter;
exports.setter = setter;
exports.updater = updater;
exports.addRow = addRow;
exports.downInsertRow = downInsertRow;
exports.insertRow = insertRow;
exports.delRow = delRow;
exports.updateRow = updateRow;
exports.delAllRow = delAllRow;
exports.delSelectedRow = delSelectedRow;
exports.getterByField = getterByField;
exports.setterByField = setterByField;
exports.updaterByField = updaterByField;
exports.selectAllRows = selectAllRows;
exports.getSelectedRows = getSelectedRows;
exports.getSelectedRowIndexs = getSelectedRowIndexs;
exports.parseMeta = parseMeta;
exports.getJson = getJson;
exports.setMetaProperty = setMetaProperty;

var _immutable = require('immutable');

var _path = require('./path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getter(state, path, propertys) {
    if (propertys === 'focusField') return state.getIn(['meta_runtime', 'focusField']);

    if (!path) return undefined;

    var parsedPath = (0, _path.parsePath)(path),
        vars = parsedPath.vars,
        sourcePath = path,
        meta = void 0,
        value = void 0,
        bindField = void 0;

    path = state.getIn(['parsedMeta', parsedPath.path]);

    var getMeta = function getMeta() {
        if (meta) {
            return meta;
        }

        meta = state.getIn(path.split('.'));
        bindField = meta.get('bindField');
        if (vars) {
            bindField = (0, _path.calcBindField)(bindField, parsedPath);
            meta = meta.merge(state.getIn(('data_runtime.' + bindField + '_runtime').split('.')));
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

        if (property === 'isFocus') return state.getIn(['meta_runtime', 'focusField']) === sourcePath;

        if (property === 'isFocusZone') {
            //debugger
            var focusField = state.getIn(['meta_runtime', 'focusField']),
                oldFocusField = state.getIn(['meta_runtime', 'oldFocusField']),
                parsedFocusField = (0, _path.parsePath)(focusField),
                parsedOldFocusField = (0, _path.parsePath)(oldFocusField);

            if (parsedPath && parsedFocusField && parsedPath.vars && parsedFocusField.vars && parsedPath.vars[0] === parsedFocusField.vars[0] && parsedFocusField.path.lastIndexOf(parsedPath.path) != -1) {
                return true;
            }

            if (parsedPath && parsedOldFocusField && parsedPath.vars && parsedOldFocusField.vars && parsedPath.vars[0] === parsedOldFocusField.vars[0] && parsedOldFocusField.path.lastIndexOf(parsedPath.path) != -1) {
                return true;
            }
            return false;
        }

        if (property === 'bindField') return getBindField();

        if (property === 'value') {
            return state.getIn(('data_runtime.' + getBindField()).split('.'));
        }

        if (property === 'emptyRow') {
            return state.getIn(['config', 'emptyRow', parsedPath.path]);
        }

        if (property === 'isSelectAll') {
            var _bindField = getBindField(),
                sgs = ('data_runtime.' + _bindField).split('.'),
                itemsPath = sgs.slice(0, sgs.length - 2),
                field = sgs[sgs.length - 1],
                items = state.getIn(itemsPath);
            if (items) {
                var i = items.findIndex(function (v) {
                    return !v.get(field);
                });
                if (items && items.size === 0) return false;
                return i === -1;
            }
            return false;
        }

        if (property === 'totalValue') {
            var _sgs = getBindField().split('.'),
                arrayPath = [],
                fieldPath = [],
                b = false;

            _sgs.forEach(function (sg, index) {
                if (b) fieldPath.push(sg);

                if (/{(\d+)}/g.test(sg)) {
                    b = true;
                }
                if (!b) arrayPath.push(sg);
            });

            var array = state.getIn(['data_runtime'].concat(arrayPath)),
                total = 0;
            if (!array) return total;
            array.forEach(function (v) {
                total += parseFloat(v.getIn(fieldPath) || '0');
            });

            if (fieldPath == 'debitAmount' || fieldPath == 'creditAmount') {
                if (total >= 9999999999.99) {
                    return total = 9999999999.99;
                } else {
                    return total;
                }
            } else {
                return total;
            }
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

    parsedPath = undefined;
    vars = undefined;
    sourcePath = undefined;
    meta = undefined;
    value = undefined;
    bindField = undefined;
    getMeta = undefined;
    getBindField = undefined;
    getPropertyValue = undefined;
    state = undefined;

    return ret;
}

function setter(state, path, property, value) {
    if (!path || !property) return state;

    if (property === 'focusField') {
        value = value || '';
        state = state.setIn(['meta_runtime', 'oldFocusField'], state.getIn(['meta_runtime', 'focusField']));
        return state.setIn(['meta_runtime', 'focusField'], value);
    }

    var parsedPath = (0, _path.parsePath)(path),
        bindField = void 0;
    path = state.getIn(['parsedMeta', parsedPath.path]);

    if (property === 'value') {
        bindField = state.getIn((path + '.bindField').split('.'));
        bindField = (0, _path.calcBindField)(bindField, parsedPath);
        state = state.setIn(('data_runtime.' + bindField).split('.'), value
        //state = updateStatus(state, bindField, 'modify')
        );return state;
    }

    if (!parsedPath.vars) {
        return state.setIn((path + '.' + property).split('.'), value);
    }

    bindField = state.getIn((path + '.bindField').split('.'));
    bindField = (0, _path.calcBindField)(bindField, parsedPath);
    return state.setIn(('data_runtime.' + bindField + '_runtime.' + property).split('.'), value);
}

function updater(state, path, property, fn) {
    if (property !== 'value') return;
    var parsedPath = (0, _path.parsePath)(path),
        bindField = void 0;
    path = state.getIn(['parsedMeta', parsedPath.path]);
    bindField = state.getIn((path + '.bindField').split('.'));
    bindField = (0, _path.calcBindField)(bindField, parsedPath);
    return state.updateIn(('data_runtime.' + bindField).split('.'), fn);
}

function addRow(state, path, value) {
    var parsedPath = (0, _path.parsePath)(path),
        bindField = void 0;
    path = state.getIn(['parsedMeta', parsedPath.path]);
    bindField = state.getIn((path + '.bindField').split('.')
    //bindField = calcBindField(bindField, parsedPath.vars)
    );path = 'data_runtime.' + bindField;
    state = state.updateIn(path.split('.'), function (x) {
        return x.push(value);
    });
    return state;
}

function downInsertRow(sate, path, value) {
    var parsedPath = (0, _path.parsePath)(path);
    return insertRow(state, parsedPath.path + "," + (parsedPath.vars[0] + 1), value);
}

function insertRow(state, path, value, findIndexFunc) {

    var parsedPath = (0, _path.parsePath)(path),
        bindField = void 0;
    path = state.getIn(['parsedMeta', parsedPath.path]);
    bindField = state.getIn((path + '.bindField').split('.'));

    path = 'data_runtime.' + bindField;
    var insertRowIndex = -1;

    if (parsedPath.vars) {
        insertRowIndex = parsedPath.vars[0];
    } else {
        insertRowIndex = state.getIn(path.split('.')).findIndex(findIndexFunc);
    }

    state = state.updateIn(path.split('.'), function (x) {
        x = x.insert(insertRowIndex, value);
        return x;
    });
    return state;
}

function delRow(state, path, findIndexFunc) {
    var parsedPath = (0, _path.parsePath)(path),
        bindField = void 0;
    path = state.getIn(['parsedMeta', parsedPath.path]);
    bindField = state.getIn((path + '.bindField').split('.'));
    path = 'data_runtime.' + bindField;
    var delRowIndex = -1;

    if (parsedPath.vars) {
        delRowIndex = parsedPath.vars[0];
    } else {
        delRowIndex = state.getIn(path.split('.')).findIndex(findIndexFunc);
    }

    bindField += "." + delRowIndex;
    //state = updateStatus(state, bindField, 'delete')

    state = state.updateIn(path.split('.'), function (x) {
        if (delRowIndex >= 0) {
            x = x.remove(delRowIndex);
        }
        return x;
    });

    return state;
}

function updateRow(state, path, value, findIndexFunc) {
    //简单处理,先删除再插入
    var parsedPath = (0, _path.parsePath)(path),
        bindField = void 0;
    path = state.getIn(['parsedMeta', parsedPath.path]);
    bindField = state.getIn((path + '.bindField').split('.'));
    path = 'data_runtime.' + bindField;
    var updateRowIndex = -1;

    if (parsedPath.vars) {
        updateRowIndex = parsedPath.vars[0];
    } else {
        updateRowIndex = state.getIn(path.split('.')).findIndex(findIndexFunc);
    }

    bindField += "." + updateRowIndex;
    //state = updateStatus(state, bindField, 'delete')

    state = state.updateIn(path.split('.'), function (x) {
        if (updateRowIndex >= 0) {
            x = x.remove(updateRowIndex);

            x = x.insert(updateRowIndex, value);
        }
        return x;
    });

    return state;
}

function delAllRow(state, path) {
    var bindField = getter(state, path, 'bindField');
    path = 'data_runtime.' + bindField;

    var rows = state.getIn(path.split('.')
    //rows.forEach((r,index)=>{
    //    state = updateStatus(state, `${bindField}.${index}`, 'delete')
    //})

    );return state.updateIn(path.split('.'), function (x) {
        return (0, _immutable.List)();
    });
}

function delSelectedRow(state, path) {
    var pValues = getter(state, path, ['bindField', '']),
        bindField = pValues.get('bindField'),
        meta = pValues.get(''),
        selectColumnName = meta.get('childrens').find(function (c) {
        return c.get('isSelectColumn');
    }).get('name'),
        selectedRowIndexs = getSelectedRowIndexs(state, path + '.' + selectColumnName).reverse();
    path = 'data_runtime.' + bindField;

    //selectedRowIndexs.forEach(i=>{
    //    state = updateStatus(state, `${bindField}.${i}`,'delete')
    //})

    state = state.updateIn(path.split('.'), function (x) {
        selectedRowIndexs.forEach(function (i) {
            x = x.remove(i);
        });
        return x;
    });

    return state;
}

function getterByField(state, fieldPath) {
    if (!fieldPath) {
        return state.get('data_runtime');
    }
    if (fieldPath === 'event') {
        return state.get('event');
    }
    if (fieldPath instanceof Array) {
        return state.getIn(['data_runtime'].concat(fieldPath));
    } else {
        return state.getIn(('data_runtime.' + fieldPath).split('.'));
    }
}

function setterByField(state, fieldPath, value) {
    if (fieldPath instanceof Array) {
        return state.setIn(['data_runtime'].concat(fieldPath), value);
    } else {
        return state.setIn(('data_runtime.' + fieldPath).split('.'), value);
    }
}

function updaterByField(state, fieldPath, fn) {
    if (fieldPath instanceof Array) {
        return state.updateIn(['data_runtime'].concat(fieldPath), fn);
    } else {
        return state.updateIn(('data_runtime.' + fieldPath).split('.'), fn);
    }
}
/*
export function mergerByField(state, fieldPath, value){
    return state.mergeDeep((`data_runtime.${fieldPath}`).split('.'), value)
}*/

function selectAllRows(state, path, seleted) {
    var arrayPath = path.substring(0, path.lastIndexOf('.')),
        field = path.substring(path.lastIndexOf('.') + 1);

    state = updater(state, arrayPath, 'value', function (v) {
        v.forEach(function (item, index) {
            v = v.setIn([index, field], seleted);
        });
        return v;
    });
    return state;
}

function getSelectedRows(state, path) {
    var arrayPath = path.substring(0, path.lastIndexOf('.')),
        field = path.substring(path.lastIndexOf('.') + 1),
        rows = getter(state, arrayPath, 'value');
    return rows.filter(function (r) {
        return !!r.get(field);
    });
}

function getSelectedRowIndexs(state, path) {
    var arrayPath = path.substring(0, path.lastIndexOf('.')),
        field = path.substring(path.lastIndexOf('.') + 1),
        rows = getter(state, arrayPath, 'value'),
        ret = [];
    rows.forEach(function (row, index) {
        if (!!row.get(field)) ret.push(index);
    });
    return ret;
}

function parseMeta(meta) {
    var ret = (0, _immutable.Map)(),
        name = meta.get('name');

    ret = ret.set(name, 'meta');

    var parseChildrens = function parseChildrens(childrens, parentPath, parentRealPath) {
        if (!childrens) return;
        childrens.forEach(function (children, index) {
            var childrenName = children.get('name'),
                path = parentPath + '.' + childrenName,
                realPath = parentRealPath + '.childrens.' + index;
            ret = ret.set(path, realPath);
            parseChildrens(children.get('childrens'), path, realPath);
        });
    };
    parseChildrens(meta.get('childrens'), name, 'meta');
    return ret;
}

function updateStatus(state, path, option) {
    if (option === 'add') return state;

    if (option === 'delete') {
        var _status = state.getIn(('data_runtime.' + path + '._status').split('.'));

        if (typeof _status === 'undefined') {
            return state;
        }

        if (_status === -1 || _status === 1 || _status === 3) {
            return state;
        }

        var arrayPath = 'data_runtime.' + path.substring(0, path.lastIndexOf('.')) + '_runtime';

        state = state.updateIn(arrayPath.split('.'), function (x) {
            x = x || (0, _immutable.Map)();
            x = x.update('deletes', function (y) {
                y = y || (0, _immutable.List)();
                y = y.push(state.getIn(('data_runtime.' + path).split('.')));
                return y;
            });
            return x;
        });
        return state;
    }

    var pathSegments = path.split('.'),
        currentPath = 'data_runtime',
        needUpdatePaths = [];

    pathSegments.forEach(function (seg, index) {
        if (index < pathSegments.length - 1) {
            currentPath += '.' + seg;

            if (!isNaN(pathSegments[index + 1])) {
                needUpdatePaths.push(currentPath + '_runtime._status');
            } else needUpdatePaths.push(currentPath + '._status');
        } else {
            currentPath += '.' + seg + '_runtime';
            needUpdatePaths.push(currentPath + '._status');
        }
    });

    var status = 2;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = (0, _getIterator3.default)(needUpdatePaths), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var p = _step.value;

            var s = state.getIn(p.split('.')
            //add or delete
            );if (s === 1 || s === 3) {
                status = s;
            }

            state = state.setIn(p.split('.'), status //modify
            );
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return state;
}
function getJson(state, path) {

    return getJsonInternal(state.getIn(('data_runtime.' + path).split('.')));
}

function getJsonInternal(value) {

    if (value instanceof _immutable.Map) {
        var result = {};
        value.keySeq().forEach(function (k) {
            if (!/_runtime/i.test(k)) {
                result[k] = getJsonInternal(value.get(k));
            }

            var deletes = value.getIn([k + '_runtime', 'deletes']);
            if (deletes) {

                deletes.forEach(function (d) {
                    result[k].push({
                        id: d.get('id'),
                        _status: 3
                    });
                });
            }
        });

        return result;
    } else if (value instanceof _immutable.List) {
        var _result = [];
        value.forEach(function (v) {
            if (v.get('_status') !== -1) _result.push(getJsonInternal(v));
        });
        return _result;
    } else {
        return value;
    }
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

(0, _assign2.default)(exports, (0, _extends3.default)({
    existsParamsInPath: _path.existsParamsInPath,
    parsePath: _path.parsePath,
    calcBindField: _path.calcBindField,
    match: _path.match
}, exports));