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
			if(typeof meta[key] == 'string' && meta[key].substring(0,2) === '$$'){
				if(!this.metaHandlers || !this.metaHandlers[meta[key].substring(2)] )
					throw `not found ${meta[key]} handler, please define in action`
				
				let handlerName = meta[key].substr(2)
				meta[key] = ()=> this.metaHandlers[handlerName]({path, rowIndex, vars})
			}

			if(key === 'children')
				this.updateChildrenMeta(meta[key], path, rowIndex, vars)

			if(key === 'bindField'){
				meta.value = this.getField(meta[key]) 
			}
		})
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
}

export default function actionCreator(option) {
	const o = new action(option)
	return {
		gm: o.getMeta,
		gf: o.getField,
		initView: o.initView,
		getMeta: o.getMeta,
		asyncGet: o.asyncGet,
		getField: o.getField,
		onEvent: o.onEvent,
		getDirectFuns: o.getDirectFuns
	}
}