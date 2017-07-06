import React from 'react'
import componentFactory from './componentFactory'
import omit from 'omit.js'


function metaToComponent(meta, props){
    if(typeof meta == 'object'){

        const propsFromMeta = {}

        Object.keys(meta).forEach(key=>{
            let v = meta[key],
                t = typeof v
            
            if( v instanceof Array){
                propsFromMeta[key] = []
                v.forEach(c=>{
                    propsFromMeta[key].push(metaToComponent(c, props))
                })
            }
            else if(t == 'object'){
                 propsFromMeta[key] = metaToComponent(v, props)
            }
            else{
                propsFromMeta[key] = v
            }
        })
    

        if(meta.component){
            const componentName = meta.component,
                component = componentFactory.getComponent(props.appName, componentName)

            var allProps = {
                ...props,
                ...propsFromMeta,
                key:meta.path
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
        else{
            return propsFromMeta
        }
    }
    else{
        return meta
    }
}

const MonkeyKing = (props) => {
	const { path, gm } = props
    const component = metaToComponent(gm(path), props)
    return component
}

export default MonkeyKing