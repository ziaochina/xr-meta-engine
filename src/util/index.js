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

window['__getCache'] = () => cache

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
    let ret = Map()

    /*
        name = meta.get('name')

    ret = ret.set(name, '')

    /*const parseChildren = (children, parentPath, parentRealPath) => {
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
    }*/


    const parseProp = (propValue, parentPath, parentRealPath) =>{

        if(typeof propValue == 'object' && propValue.get && propValue.get('name') && propValue.get('component')){
            const path = parentPath ? `${parentPath}.${propValue.get('name')}` : propValue.get('name')
            ret = ret.set(path, parentRealPath)

            propValue.keySeq().toArray().forEach(p=>{
                let v = propValue.get(p)
                if(p == 'children'){
                    if(v && typeof v != 'string'){
                        v.forEach((child,index)=>{
                            let currentRealPath = parentRealPath ? `${parentRealPath}.children.${index}`: `children.${index}`
                            parseProp(child, path, currentRealPath)
                        })
                    }
                }
                else{
                    if(v instanceof Array){
                        v.forEach((c, index)=>{
                            let currentRealPath = parentRealPath ? `${parentRealPath}.${p}.${index}`: `${p}.${index}`
                            parseProp(child, `${path}.#${p}`, currentRealPath)
                        })
                    }else{
                        let currentRealPath = parentRealPath ? `${parentRealPath}.${p}`: p
                        parseProp(v, `${path}.#${p}`,  currentRealPath)

                    }

                }
            })
        }
    }

    parseProp(meta, '', '')
    debugger
/*
    meta.keySeq().toArray().forEach(p=>{


         if(p != 'children' && p != 'name' && p != 'component'){
            parseProp(meta.get(p), `${name}.#${p}`, `${name}.${p}`)
        }
    })

    parseChildren(meta.get('children'), name, '')
    */
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
        return state.getIn(fieldPath)
    } else {
        return state.getIn(fieldPath.split('.'))
    }
}

export function setField(state, fieldPath, value) {
    if (fieldPath instanceof Array) {
        return state.setIn(fieldPath, value)
    } else {
        return state.setIn(fieldPath.split('.'), value)
    }
}

export function updateField(state, fieldPath, fn) {
    if (fieldPath instanceof Array) {
        return state.updateIn(fieldPath, fn)
    } else {
        return state.updateIn(fieldPath.split('.'), fn)
    }
}




Object.assign(exports, {
    existsParamsInPath,
    parsePath,
    calcBindField,
    match,
    ...exports
})