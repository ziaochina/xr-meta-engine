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



export function get(state, path, propertys) {
    if (propertys === 'focusField')
        return state.getIn(['meta_runtime', 'focusField'])

    if (!path)
        return undefined

    var parsedPath = parsePath(path),
        vars = parsedPath.vars,
        sourcePath = path,
        meta, value, bindField

    path = state.getIn(['parsedMeta', parsedPath.path])

    const getMeta = () => {
        if (meta) {
            return meta
        }

        meta = state.getIn(path.split('.'))
        bindField = meta.get('bindField')
        if (vars) {
            bindField = calcBindField(bindField, parsedPath)
            meta = meta.merge(state.getIn((`data.${bindField}_runtime`).split('.')))
        }
        return meta
    }

    const getBindField = () => {
        if (bindField)
            return bindField
        getMeta(path)
        return bindField
    }

    const getPropertyValue = (property) => {
        if (!property)
            return getMeta()

        if (property === 'isFocus')
            return state.getIn(['other', 'focusField']) === sourcePath


        if (property === 'bindField')
            return getBindField()

        if (property === 'value') {
            return state.getIn((`data.${getBindField()}`).split('.'))
        }

        return getMeta().getIn(property.split('.'))
    }


    var ret = undefined
    if (propertys instanceof Array) {
        ret = Map()
        propertys.forEach(p => {
            ret = ret.set(p, getPropertyValue(p))
        })

    } else {
        ret = getPropertyValue(propertys)
    }


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


export function set(state, path, property, value) {
    if (!path || !property)
        return state

    if (property === 'focusField') {
        value = value || ''
        state = state.setIn(['other', 'oldFocusField'], state.getIn(['other', 'focusField']))
        return state.setIn(['other', 'focusField'], value)
    }

    let parsedPath = parsePath(path),
        bindField
    path = state.getIn(['parsedMeta', parsedPath.path])

    if (property === 'value') {
        bindField = state.getIn((`${path}.bindField`).split('.'))
        bindField = calcBindField(bindField, parsedPath)
        state = state.setIn((`data.${bindField}`).split('.'), value)
        return state
    }

    if (!parsedPath.vars) {
        return state.setIn((`${path}.${property}`).split('.'), value)
    }

    bindField = state.getIn((`${path}.bindField`).split('.'))
    bindField = calcBindField(bindField, parsedPath)
    return state.setIn((`data.${bindField}_runtime.${property}`).split('.'), value)
}


export function update(state, path, property, fn) {
    if (property !== 'value') return
    let parsedPath = parsePath(path),
        bindField
    path = state.getIn(['parsedMeta', parsedPath.path])
    bindField = state.getIn((`${path}.bindField`).split('.'))
    bindField = calcBindField(bindField, parsedPath)
    return state.updateIn((`data.${bindField}`).split('.'), fn)
}


export function getField(state, fieldPath) {
    if (!fieldPath) {
        return state.get('data')
    }
    
    if (fieldPath instanceof Array) {
        return state.getIn(['data'].concat(fieldPath))
    } else {
        return state.getIn((`data.${fieldPath}`).split('.'))
    }
}

export function setField(state, fieldPath, value) {
    if (fieldPath instanceof Array) {
        return state.setIn(['data'].concat(fieldPath), value)
    } else {
        return state.setIn((`data.${fieldPath}`).split('.'), value)
    }
}

export function updateField(state, fieldPath, fn) {
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

    let parseChildren = (children, parentPath, parentRealPath) => {
        if (!children) return
        children.forEach((child, index) => {
            let childName = child.get('name'),
                path = `${parentPath}.${childName}`,
                realPath = `${parentRealPath}.children.${index}`
            ret = ret.set(path, realPath)
            parseChildren(children.get('children'), path, realPath)
        })
    }
    parseChildren(meta.get('children'), name, 'meta')
    return ret
}




Object.assign(exports, {
    existsParamsInPath,
    parsePath,
    calcBindField,
    match,
    ...exports
})