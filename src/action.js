import * as util from './util'

class action {
	constructor(option) {
		this.appName = option.appInfo.name
		this.event = option.event

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

		this.event.root && this.event.root.onInit && this.event.root.onInit({
			component,
			injections
		})
	}

	getField(fieldPath) {
		return util.getField(this.injections.getState(), fieldPath)
	}

	getEventValue(path, property){
		if (this.event && this.event[path] && this.event[path][property]) {

		}
	}

	updateChildrenMeta(childrenMeta, parentPath, rowIndex, vars){
		if( !childrenMeta || childrenMeta.size == 0)
			return 

		childrenMeta.map(child=>{
			this.updateMeta(child, `${parentPath}.${child.name}`, rowIndex, vars)
		})
	}

	updateMeta(meta, path, rowIndex, vars ){
		Object.keys(meta).forEach(key => {
			if (this.event && this.event[path] && this.event[path][key]) {
				meta[key] = this.event[path][key]({path, rowIndex, vars})
			}

			if(key === 'children')
				this.updateChildrenMeta(meta[key], path, rowIndex, vars)

			if(key === 'bindField'){
				meta.value = this.getField(meta[key]) 
			}
		})
	}

	getMeta(fullPath, propertys){
		var meta = util.get(this.injections.getState(), fullPath, propertys),
			parsedPath = util.parsePath(fullPath),
			path = parsedPath.path,
			rowIndex = parsedPath.vars ? parsedPath.vars[0] : undefined,
			vars = parsedPath.vars

		meta = meta.toJS()
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
		var parsedPath = _a.parsePath(option.path),
			eventSource = (parsedPath || {
				path: 'root'
			}).path

		if (this.event && this.event[eventSource] && this.event[eventSource][eventName]) {
			this.event[eventSource][eventName]({
				...option,
				path: eventSource,
				rowIndex: parsedPath.vars ? parsedPath.vars[0] : option.rowIndex
			})
		} else {
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