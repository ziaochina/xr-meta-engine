import React from 'react'
import componentFactory from './componentFactory'
import omit from 'omit.js'

function getComponent(path, meta, props) {
    if(typeof meta == 'string')
        return meta

    const componentName = meta.component

    if (!componentName) {
        return 
    }

    const component = componentFactory.getComponent(props.appName, componentName)

    var childrenProp = meta.children 

    if(typeof meta.children != 'string'){
        childrenProp = getChildrenProp(path, meta.children, props)
    }

    for(let p in meta){
        if(p !='children' && typeof meta[p] == 'object' && meta[p].component){
            meta[p] = getComponent(`${path}.#${p}.${meta[p].name}`, meta[p], props)
        }
    }

    var allProps = {
        ...props, 
        ...meta,
        children:childrenProp,
        path:path,
        key:path
    }

    allProps = omit(allProps, ['clearAppState', 'component', 'name', 'getDirectFuns', 'initView', 'payload'])

    if(allProps['_visible'] === false)
        return null
    
    if(typeof component == 'string' || component.prototype.isReactComponent){
        return React.createElement(component, allProps)
    }
    else{
        return component(allProps)
    }
}



function getChildrenProp(parentPath, childrenMeta, props){
    if(!childrenMeta || childrenMeta.length == 0)    
        return

    const ret = []
    childrenMeta.forEach(c=>{
        ret.push(getComponent(`${parentPath}.${c.name}`, c, props)) 
    })

    return ret
}

const MonkeyKing = (props) => {
	const { path, gm } = props
    return getComponent(path, gm(path), props)
}

export default MonkeyKing