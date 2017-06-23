import {
    Map,
    List
} from 'immutable'

import {
    existsParamsInPath,
    parsePath,
    calcBindField,
    match
} from './path'

export function getter(state, path, propertys) {
    if (propertys === 'focusField')
        return state.getIn(['meta_runtime', 'focusField'])

    if (!path)
        return undefined

    let parsedPath = parsePath(path),
        vars = parsedPath.vars,
        sourcePath = path,
        meta, value, bindField

    path = state.getIn(['parsedMeta', parsedPath.path])

    let getMeta = () => {
        if (meta) {
            return meta
        }

        meta = state.getIn(path.split('.'))
        bindField = meta.get('bindField')
        if (vars) {
            bindField = calcBindField(bindField, parsedPath)
            meta = meta.merge(state.getIn((`data_runtime.${bindField}_runtime`).split('.')))
        }
        return meta
    }

    let getBindField = () => {
        if (bindField)
            return bindField
        getMeta(path)
        return bindField
    }

    let getPropertyValue = (property) => {
        if (!property)
            return getMeta()

        if (property === 'isFocus')
            return state.getIn(['meta_runtime', 'focusField']) === sourcePath

        if (property === 'isFocusZone') {
            //debugger
            let focusField = state.getIn(['meta_runtime', 'focusField']),
                oldFocusField = state.getIn(['meta_runtime', 'oldFocusField']),
                parsedFocusField = parsePath(focusField),
                parsedOldFocusField = parsePath(oldFocusField)

            if (parsedPath && parsedFocusField && parsedPath.vars &&
                parsedFocusField.vars &&
                parsedPath.vars[0] === parsedFocusField.vars[0] && parsedFocusField.path.lastIndexOf(parsedPath.path) != -1) {
                return true
            }

            if (parsedPath && parsedOldFocusField && parsedPath.vars &&
                parsedOldFocusField.vars &&
                parsedPath.vars[0] === parsedOldFocusField.vars[0] &&
                parsedOldFocusField.path.lastIndexOf(parsedPath.path) != -1) {
                return true
            }
            return false

        }

        if (property === 'bindField')
            return getBindField()

        if (property === 'value') {
            return state.getIn((`data_runtime.${getBindField()}`).split('.'))
        }

        if (property === 'emptyRow') {
            return state.getIn(['config', 'emptyRow', parsedPath.path])
        }

        if (property === 'isSelectAll') {
            let bindField = getBindField(),
                sgs = (`data_runtime.${bindField}`).split('.'),
                itemsPath = sgs.slice(0, sgs.length - 2),
                field = sgs[sgs.length - 1],
                items = state.getIn(itemsPath)
            if (items) {
                let i = items.findIndex(v => !v.get(field))
                if (items && items.size === 0) return false
                return i === -1
            }
            return false
        }

        if (property === 'totalValue') {
            let sgs = getBindField().split('.'),
                arrayPath = [],
                fieldPath = [],
                b = false

            sgs.forEach((sg, index) => {
                if (b)
                    fieldPath.push(sg)

                if (/{(\d+)}/g.test(sg)) {
                    b = true
                }
                if (!b)
                    arrayPath.push(sg)
            })

            let array = state.getIn(['data_runtime'].concat(arrayPath)),
                total = 0
            if (!array) return total
            array.forEach(v => {
                total += parseFloat(v.getIn(fieldPath) || '0')
            })

            if (fieldPath == 'debitAmount' || fieldPath == 'creditAmount') {
                if (total >= 9999999999.99) {
                    return total = 9999999999.99
                } else {
                    return total
                }
            } else {
                return total
            }

        }

        return getMeta().getIn(property.split('.'))
    }


    let ret = undefined
    if (propertys instanceof Array) {
        ret = Map()
        propertys.forEach(p => {
            ret = ret.set(p, getPropertyValue(p))
        })


    } else {
        ret = getPropertyValue(propertys)
    }

    parsedPath = undefined
    vars = undefined
    sourcePath = undefined
    meta = undefined
    value = undefined
    bindField = undefined
    getMeta = undefined
    getBindField = undefined
    getPropertyValue = undefined
    state = undefined

    return ret
}

export function setter(state, path, property, value) {
    if (!path || !property)
        return state

    if (property === 'focusField') {
        value = value || ''
        state = state.setIn(['meta_runtime', 'oldFocusField'], state.getIn(['meta_runtime', 'focusField']))
        return state.setIn(['meta_runtime', 'focusField'], value)
    }

    let parsedPath = parsePath(path),
        bindField
    path = state.getIn(['parsedMeta', parsedPath.path])

    if (property === 'value') {
        bindField = state.getIn((`${path}.bindField`).split('.'))
        bindField = calcBindField(bindField, parsedPath)
        state = state.setIn((`data_runtime.${bindField}`).split('.'), value)
            //state = updateStatus(state, bindField, 'modify')
        return state
    }

    if (!parsedPath.vars) {
        return state.setIn((`${path}.${property}`).split('.'), value)
    }

    bindField = state.getIn((`${path}.bindField`).split('.'))
    bindField = calcBindField(bindField, parsedPath)
    return state.setIn((`data_runtime.${bindField}_runtime.${property}`).split('.'), value)
}


export function updater(state, path, property, fn) {
    if (property !== 'value') return
    let parsedPath = parsePath(path),
        bindField
    path = state.getIn(['parsedMeta', parsedPath.path])
    bindField = state.getIn((`${path}.bindField`).split('.'))
    bindField = calcBindField(bindField, parsedPath)
    return state.updateIn((`data.${bindField}`).split('.'), fn)
}


export function addRow(state, path, value) {
    let parsedPath = parsePath(path),
        bindField
    path = state.getIn(['parsedMeta', parsedPath.path])
    bindField = state.getIn((`${path}.bindField`).split('.'))
        //bindField = calcBindField(bindField, parsedPath.vars)
    path = `data.${bindField}`
    state = state.updateIn(path.split('.'), x => x.push(value))
    return state
}


export function downInsertRow(sate, path, value) {
    let parsedPath = parsePath(path)
    return insertRow(state, parsedPath.path + "," + (parsedPath.vars[0] + 1), value)
}

export function insertRow(state, path, value, findIndexFunc) {

    let parsedPath = parsePath(path),
        bindField
    path = state.getIn(['parsedMeta', parsedPath.path])
    bindField = state.getIn((`${path}.bindField`).split('.'))

    path = `data.${bindField}`
    let insertRowIndex = -1

    if (parsedPath.vars) {
        insertRowIndex = parsedPath.vars[0]
    } else {
        insertRowIndex = state.getIn(path.split('.')).findIndex(findIndexFunc)
    }

    state = state.updateIn(path.split('.'), x => {
        x = x.insert(insertRowIndex, value)
        return x
    })
    return state
}


export function delRow(state, path, findIndexFunc) {
    let parsedPath = parsePath(path),
        bindField
    path = state.getIn(['parsedMeta', parsedPath.path])
    bindField = state.getIn((`${path}.bindField`).split('.'))
    path = `data.${bindField}`
    let delRowIndex = -1

    if (parsedPath.vars) {
        delRowIndex = parsedPath.vars[0]
    } else {
        delRowIndex = state.getIn(path.split('.')).findIndex(findIndexFunc)
    }

    bindField += "." + delRowIndex
        //state = updateStatus(state, bindField, 'delete')

    state = state.updateIn(path.split('.'), x => {
        if (delRowIndex >= 0) {
            x = x.remove(delRowIndex)
        }
        return x
    })

    return state
}

export function updateRow(state, path, value, findIndexFunc) {
    //简单处理,先删除再插入
    let parsedPath = parsePath(path),
        bindField
    path = state.getIn(['parsedMeta', parsedPath.path])
    bindField = state.getIn((`${path}.bindField`).split('.'))
    path = `data.${bindField}`
    let updateRowIndex = -1

    if (parsedPath.vars) {
        updateRowIndex = parsedPath.vars[0]
    } else {
        updateRowIndex = state.getIn(path.split('.')).findIndex(findIndexFunc)
    }

    bindField += "." + updateRowIndex
        //state = updateStatus(state, bindField, 'delete')

    state = state.updateIn(path.split('.'), x => {
        if (updateRowIndex >= 0) {
            x = x.remove(updateRowIndex)

            x = x.insert(updateRowIndex, value)
        }
        return x
    })

    return state
}

export function delAllRow(state, path) {
    let bindField = getter(state, path, 'bindField')
    path = `data.${bindField}`

    let rows = state.getIn(path.split('.'))
        //rows.forEach((r,index)=>{
        //    state = updateStatus(state, `${bindField}.${index}`, 'delete')
        //})

    return state.updateIn(path.split('.'), x => List())
}



export function getterByField(state, fieldPath) {
    if (!fieldPath) {
        return state.get('data')
    }
    
    if (fieldPath instanceof Array) {
        return state.getIn(['data'].concat(fieldPath))
    } else {
        return state.getIn((`data.${fieldPath}`).split('.'))
    }
}

export function setterByField(state, fieldPath, value) {
    if (fieldPath instanceof Array) {
        return state.setIn(['data'].concat(fieldPath), value)
    } else {
        return state.setIn((`data.${fieldPath}`).split('.'), value)
    }
}

export function updaterByField(state, fieldPath, fn) {
    if (fieldPath instanceof Array) {
        return state.updateIn(['data'].concat(fieldPath), fn)
    } else {
        return state.updateIn((`data.${fieldPath}`).split('.'), fn)
    }
}



export function parseMeta(meta) {
    let ret = Map(),
        name = meta.get('name')

    ret = ret.set(name, 'meta')

    let parseChildrens = (childrens, parentPath, parentRealPath) => {
        if (!childrens) return
        childrens.forEach((children, index) => {
            let childrenName = children.get('name'),
                path = `${parentPath}.${childrenName}`,
                realPath = `${parentRealPath}.childrens.${index}`
            ret = ret.set(path, realPath)
            parseChildrens(children.get('childrens'), path, realPath)
        })
    }
    parseChildrens(meta.get('childrens'), name, 'meta')
    return ret
}


export function setMetaProperty(meta, propertyPath, value) {
    if (!meta || !propertyPath) return meta

    let pathSegments = propertyPath.split('.'),
        property, current

    pathSegments.every((p, index) => {
        if (index == 0 && meta.name != p)
            return false

        if (index == 0) {
            current = meta
            return true
        }

        if (index == pathSegments.length - 1) {
            current[p] = value
            return false
        }

        if (!current.childrens || current.childrens.length == 0)
            return false

        return !current.childrens.every((c, index) => {
            if (c.name == p) {
                current = c
                return false
            }
            return true
        })

    })

    return meta
}


Object.assign(exports, {
    existsParamsInPath,
    parsePath,
    calcBindField,
    match,
    ...exports
})