import * as util from './util'
import {fromJS} from 'immutable'

class action {
	constructor(option) {
		this.appInfo = option.appInfo
		this.appName = option.appInfo.name
		this.meta = fromJS(option.appInfo.meta)
		this.metaMap = util.parseMeta(this.meta)
		this.metaHandlers = option.metaHandlers

		util.setMeta(option.appInfo)

		this.initView = this.initView.bind(this)
		this.getField = this.getField.bind(this)
		this.getMeta = this.getMeta.bind(this)
		this.asyncGet = this.asyncGet.bind(this)
		this.onEvent = this.onEvent.bind(this)
		this.getDirectFuns = this.getDirectFuns.bind(this)
	}

	initView(component, injections) {
		this.component = component
		this.injections = injections

		this.metaHandlers && this.metaHandlers['onInit'] && this.metaHandlers['onInit']({component, injections})
	}

	getField(fieldPath) {
		return util.getField(this.injections.getState(), fieldPath)
	}

	setField(fieldPath, value){
		return this.injections.reduce('setField', fieldPath, value)
	}

	updateChildrenMeta(childrenMeta, parentPath, rowIndex, vars){
		if( !childrenMeta || childrenMeta.size == 0)
			return 

		if(typeof childrenMeta === 'string')
			return
		
		childrenMeta.map(child=>{
			this.updateMeta(child, `${parentPath}.${child.name}`, rowIndex, vars)
		})
	}

	updateMeta(meta, path, rowIndex, vars ){
		Object.keys(meta).forEach(key => {
			//$$getVisible
			if(typeof meta[key] == 'string' && meta[key].substring(0,2) === '$$'){
				if(!this.metaHandlers || !this.metaHandlers[meta[key].substring(2)] )
					throw `not found ${meta[key]} handler, please define in action`
				
				let handlerName = meta[key].substr(2)
				meta[key] = ()=> this.metaHandlers[handlerName]({path, rowIndex, vars})
			}

			//##form.code
			if(typeof meta[key] == 'string' && meta[key].substring(0,2) === '##'){
				meta[key] = this.getField(calcBindField(meta[key].substr(2), vars))
			}

			//args[0].target.value->form.code
			if(typeof meta[key] == 'string' && meta[key].indexOf('->') !== -1){
				const tmp = meta[key].replace('->', ';').split(';')
				const f = new Function('args', 'fieldPath', 'valueExpress', 'setField', `setField(fieldPath, valueExpress)`)
				meta[key] = (...args)=> f(args, this.calcBindField(tmp[1], vars), tmp[0], this.setField)
			}

			if(typeof meta[key] == 'object' && meta[key].component){
				updateMeta(meta[key], parent + '.' + key, rowIndex, vars)
			}


			if(key === 'children')
				this.updateChildrenMeta(meta[key], path, rowIndex, vars)

			if(key === 'bindField'){
				meta.value = this.getField(meta[key]) 
			}
		})
	}

	calcBindField(bindField, vars) {
	    if(!bindField) return bindField

	    if(!vars) return bindField

	    var hit = false

	    //root.detail.code,0;form.detail.${0}.code => form.detail.0.code
	    //root.detail,0;form.detail => form.detail.0
	    bindField = bindField.replace(/{(\d+)}/g, (match, index)=> {
	        hit = true
	        return vars[index]
	    })
	    return hit ? bindField : bindField + '.' + vars[0]
	}

	getMeta(fullPath, propertys){
		const meta = util.getMeta(this.appInfo, fullPath, propertys),
			parsedPath = util.parsePath(fullPath),
			path = parsedPath.path,
			rowIndex = parsedPath.vars ? parsedPath.vars[0] : undefined,
			vars = parsedPath.vars

		this.updateMeta(meta, path, rowIndex, vars)
		return meta
	}

	async asyncGet(path, property) {
		var parsedPath = util.parsePath(path),
			eventSource = (parsedPath || {
				path: 'root'
			}).path

		if (typeof property === 'string') {
			if (this.event && this.event[eventSource] && this.event[eventSource][propertys]) {

				var response = await this.event[eventSource][propertys]({
					path: eventSource,
					rowIndex: parsedPath.vars ? parsedPath.vars[0] : undefined
				})

				return Promise.resolve(response)
			}
		}
	}

	onEvent(eventName, option) {
		var parsedPath = util.parsePath(option.path),
			eventSource = (parsedPath || {
				path: 'root'
			}).path

		const strHandler = util.getMeta(this.appInfo, eventSource, eventName)
		if(strHandler && strHandler.substring(0,2) === '$$' && this.metaHandlers[strHandler.substr(2)]){
			this.metaHandlers[strHandler.substr(2)]({
				...option,
				path: eventSource,
				rowIndex: parsedPath.vars ? parsedPath.vars[0] : option.rowIndex
			})
		}
		else {
			this.injections.reduce('onEvent', eventName, option)
		}
	}


	getDirectFuns() {
		return {
			getMeta: (path, propertys) => {
				return this.getMeta(path, propertys)
			},
			getField: (fieldPath) => {
				return this.getField(fieldPath)
			},
			asyncGet: async(path, propertys) => {
				return await this.asyncGet(path, property)
			},
			gm:(path, propertys) => {
				return this.getMeta(path, propertys)
			},
			gf:(fieldPath) => {
				return this.getField(fieldPath)
			},
			ag:async(path, propertys) => {
				return await this.asyncGet(path, property)
			}
		}
	}

	getPublishMethods(){
		return {
			initView:this.initView,
			getMeta:this.getMeta,
			asyncGet:this.asyncGet,
			getField:this.getField,
			onEvent:this.onEvent,
			getDirectFuns:this.getDirectFuns,
			gm:this.getMeta,
			gf:this.getField
		}
	}
}

export default function creator(option) {
	return new action(option).getPublishMethods()
}