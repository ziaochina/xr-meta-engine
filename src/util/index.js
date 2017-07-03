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

export function parseMeta(meta) {
    let ret = Map(),
        name = meta.get('name')

    ret = ret.set(name, '')

    const parseChildren = (children, parentPath, parentRealPath) => {
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


    const parseProp = (propValue, parentPath, parentRealPath) =>{
        if(isComponent(propValue)){
           
            ret = ret.set(parentPath, parentRealPath)

            for(let p in propValue){
                if(p != 'children' && p != 'name' && p != 'component'){
                    parseProp(propValue[p], `${parentPath}.#${p}`, `${parentRealPath}.${p}`)
                }
            }
        }
    }

    for(let p in meta){
        if(p != 'children' && p != 'name' && p != 'component'){
            parseProp(meta[p], `${name}.#${p}`, `${name}.${p}`)
        }
    }

    parseChildren(meta.get('children'), name, '')
    return ret
}



function isComponent(meta){
    return typeof meta == 'object' && !!meta.name && !!meta.component
}



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
            if(p == 'bindField'){
                ret[p] = calcBindField(val, parsedPath)
            }
            else{
                ret[p] = (val && val.toJS) ? val.toJS() : val    
            }
            
        })

        return ret
    } 

    if( typeof propertys == 'string') {
        let val = currentMeta.getIn(propertys.split('.'))
        if(propertys == 'bindField'){
            return calcBindField(val, parsedPath)
        }
        return (val && val.toJS) ? val.toJS() : val
    }

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




Object.assign(exports, {
    existsParamsInPath,
    parsePath,
    calcBindField,
    match,
    ...exports
})