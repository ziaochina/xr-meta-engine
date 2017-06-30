import {
    Map,
    List,
    fromJS
} from 'immutable'

import {
    existsParamsInPath,
    parsePath,
    calcBindField,
    match
} from './path'

const cache = { meta:Map()}

export function getMeta(appInfo, fullpath, propertys){

    if (!fullpath)
        return cache.meta.getIn([appInfo.name,'meta']).toJS()

    const parsedPath = parsePath(fullpath),
        vars = parsedPath.vars,
        metaMap = cache.meta.getIn([appInfo.name,'metaMap']),
        meta = cache.meta.getIn([appInfo.name,'meta'])

    const path = metaMap.get(parsedPath.path)

    const currentMeta = path ? meta.getIn(path.split('.')) : meta

    if(!propertys)
        return currentMeta.toJS()

    const ret = {}

    if (propertys instanceof Array) {
        propertys.forEach(p => {
            let val = currentMeta.getIn(p.split('.'))
            ret[p] = (val && val.toJS) ? val.toJS() : val
        })

    } else {
        let val = currentMeta.getIn(propertys.split('.'))
        ret[propertys] = (val && val.toJS) ? val.toJS() : val
    }

    return ret
}

export function setMeta(appInfo) {

    if(!appInfo || !appInfo.meta) return

    const appName = appInfo.name

    if( cache.meta.has(appName) )
        return

    const meta = fromJS(appInfo.meta)

    cache.meta = cache.meta
        .setIn([appName,'meta'], meta)
        .setIn([appName, 'metaMap'], parseMeta(meta))
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

    ret = ret.set(name, '')

    let parseChildren = (children, parentPath, parentRealPath) => {
        if (!children) return
        parentRealPath = parentRealPath? `${parentRealPath}.` : parentRealPath
        children.forEach((child, index) => {
            if(typeof child !='string'){
                let childName = child.get('name'),
                    path = `${parentPath}.${childName}`,
                    realPath = `${parentRealPath}children.${index}`
                ret = ret.set(path, realPath)
                parseChildren(children.get('children'), path, realPath)
            }
        })
    }
    parseChildren(meta.get('children'), name, '')
    return ret
}




Object.assign(exports, {
    existsParamsInPath,
    parsePath,
    calcBindField,
    match,
    ...exports
})