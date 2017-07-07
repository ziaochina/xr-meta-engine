import React from 'react'
import { AppLoader } from 'xr-app-loader'
import componentFactory from './componentFactory'
import omit from 'omit.js'

function parseMetaProps(meta, props) {
    const ret = {}

    Object.keys(meta).forEach(key => {
        let v = meta[key],
            t = typeof v

        if (v instanceof Array) {
            ret[key] = []
            v.forEach(c => {
                let mc = metaToComponent(c, props)
                if(mc instanceof Array)
                    ret[key] = ret[key].concat(mc)
                else
                    ret[key].push(mc)
            })
        }
        else if (t == 'object') {
            ret[key] = metaToComponent(v, props)
        }
        else {
            ret[key] = v
        }
    })

    return ret
}

function metaToComponent(meta, props) {
    if (typeof meta == 'object') {

        if (meta.component) {
            if (meta['_visible'] === false)
                return null

            if (meta['_power'] && /for[ ]+in/.test(meta['_power'])) {
                let items = props.gf(meta['_power'].replace(/for[ ]+in/, '').replace(' ', ''))
                
                if (!items || items.size == 0) return
                items = items.toJS()
                return items.map((o, index) => {
                    return  metaToComponent({...props.gm(meta.path + ',' +index), _power:undefined}, props)
                })
            }

            if(meta['_power'] && meta['_power'].index('=>')!=-1){
                return (...args) =>{
                    let varsString = new Function('return '+meta['_power'])(...args)
                    return metaToComponent({...props.gm(meta.path + ',' + varsString), _power:undefined}, props)
                }
            }

            const componentName = meta.component,
                component = componentFactory.getComponent(props.appName, componentName)

            var allProps = {
                ...props,
                ...parseMetaProps(meta, props),
                key: meta.path
            }

            allProps = omit(allProps, ['clearAppState', 'component', 'name', 'getDirectFuns', 'initView', 'payload'])

            if (allProps['_visible'] === false)
                return null

            if (typeof component == 'string' || component.prototype.isReactComponent) {
                return React.createElement(component, allProps)
            }
            else {
                return component(allProps)
            }
        }
        else {
            return parseMetaProps(meta, props)
        }
    }
    else {
        return meta
    }
}

const MonkeyKing = (props) => {
    const { path, gm } = props
    const component = metaToComponent(gm(path), props)
    return component
}

export default MonkeyKing