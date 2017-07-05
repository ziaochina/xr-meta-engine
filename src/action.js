import * as util from './util'
import {fromJS} from 'immutable'

class action {
	constructor(option) {
		this.appInfo = option.appInfo
		this.meta = fromJS(option.appInfo.meta)
		this.cache = {}


		util.setMeta(option.appInfo)
	}

	setMetaHandlers = metaHandlers => {
		this.metaHandlers = metaHandlers
	}

	initView = (component, injections) => {
		this.component = component
		this.injections = injections

		this.metaHandlers && this.metaHandlers['onInit'] && this.metaHandlers['onInit']({component, injections})
	}

	getField = (fieldPath) => {
		return util.getField(this.injections.getState(), fieldPath)
	}

	setField = (fieldPath, value) => {
		return this.injections.reduce('setField', fieldPath, value)
	}


	parseExpreesion = (v) =>{
		const reg = new RegExp(/\{\{([^{}]+)\}\}/)

		if(!this.cache.expression)
			this.cache.expression = {}

		if(this.cache.expression[v]){
			return this.cache.expression[v]
		}

		if(!this.cache.expressionParams){
			this.cache.expressionParams = ['data']
				.concat(Object.keys(this.metaHandlers).map(k=>"$"+k))
				.concat(['_path', '_rowIndex', '_vars'])
		}

		var params = this.cache.expressionParams

		var body = "return " + v
			.replace(reg, (word,group)=> group)
			.replace(/\([ ]*\)/g, word=>`({path:_path, rowIndex:_rowIndex, vars: _vars})`)

		this.cache.expression[v] = new Function(...params, body)

		return this.cache.expression[v]
	}

	updateChildrenMeta = (childrenMeta, parentPath, rowIndex, vars, data) => {
		if( !childrenMeta || childrenMeta.size == 0)
			return 

		if(typeof childrenMeta === 'string')
			return
		
		childrenMeta.map(child=>{
			this.updateMeta(child, `${parentPath}.${child.name}`, rowIndex, vars, data)
		})
	}



	updateMeta = (meta, path, rowIndex, vars, data ) => {
		const reg = new RegExp(/\{\{([^{}]+)\}\}/)

		Object.keys(meta).forEach(key => {
			let v = meta[key],
				t = typeof v

			if(key === 'children'){
				this.updateChildrenMeta(meta[key], path, rowIndex, vars, data)
			}

			else if(t == 'string' && reg.test(v)){

				let f = this.parseExpreesion(v)
				
				let values = [data]

				Object.keys(this.metaHandlers).forEach(k=>{
					values.push(this.metaHandlers[k])
				})

				values = values.concat([path, rowIndex, vars])
				meta[key] = f.apply(this, values)
			}
/*
			else if(t == 'string' && v.length > 2){
				
			
				//$$ action function
				if(v.substring(0,2) == '$$'){

					let handlerName = meta[key].substr(2)

					if(!this.metaHandlers || !this.metaHandlers[handlerName] )
						throw `not found ${v} handler, please define in action`
					
					meta[key] = (...args)=> {
						this.metaHandlers[handlerName]({...args, path, rowIndex, vars})
					}

					meta[key] = meta[key].bind(this)
				}

				//$= exec action function
				else if(v.substring(0,2) == '$='){
					let handlerName = meta[key].substr(2)

					if(!this.metaHandlers || !this.metaHandlers[handlerName] )
						throw `not found ${v} handler, please define in action`

					meta[key] = this.metaHandlers[handlerName]({path, rowIndex, vars})
				}

				//%= state field value
				else if(v.substring(0,2) == '%='){
					meta[key] = this.getField(this.calcBindField(v.substr(2), vars))
				}

				//event argument -> state field
				else if(v.indexOf('->') != -1){

					const tmp = meta[key].replace('->', ';').split(';')
					const f = new Function('args', 'fieldPath', 'setField', `setField(fieldPath, ${tmp[0]})`).bind(this)
					
					meta[key] = (...args) => {
						f(args, this.calcBindField(tmp[1], vars),  this.setField)
					}

					meta[key] = meta[key].bind(this)
				}
			}
*/

			else if(t == 'object' && v.component){
				this.updateMeta(meta[key], path + '.' + key, rowIndex, vars, data)
			}
		})
	}

	calcBindField = (bindField, vars) => {
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

	getMeta = (fullPath, propertys) => {
		const meta = util.getMeta(this.appInfo, fullPath, propertys),
			parsedPath = util.parsePath(fullPath),
			path = parsedPath.path,
			rowIndex = parsedPath.vars ? parsedPath.vars[0] : undefined,
			vars = parsedPath.vars,
			data = util.getField(this.injections.getState()).toJS() 

		this.updateMeta(meta, path, rowIndex, vars, data)
		return meta
	}

	asyncGet = async (path, property) => {
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

	onEvent = (eventName, option) => {
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


	getDirectFuns = () => {
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

	gm = this.getMeta

	gf = this.getField
}

export default function creator(option) {
	return new action(option)
}