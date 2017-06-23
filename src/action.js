import * as util from './util'

class action {
	constructor(option) {
		this.appName = option.appInfo.name
		this.event = option.event
		this.realAction = option.exps

		this.initView = this.initView.bind(this)
		this.getterByField = this.getterByField.bind(this)
		this.getter = this.getter.bind(this)
		this.asyncGetter = this.asyncGetter.bind(this)
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

	getterByField(fieldPath) {
		return util.getterByField(this.injections.getState(), fieldPath)
	}

	getter(path, propertys) {
		var ret = util.getter(this.injections.getState(), path, propertys),
			parsedPath = util.parsePath(path),
			eventSource = (parsedPath || {
				path: 'root'
			}).path

		if (!propertys) {
			return ret
		}

		if (typeof propertys === 'string') {
			if (this.event && this.event[eventSource] && this.event[eventSource][propertys]) {
				ret = this.event[eventSource][propertys]({
					path: eventSource,
					rowIndex: parsedPath.vars ? parsedPath.vars[0] : undefined
				})
			}
			return ret
		}

		if (propertys.constructor === Array) {
			for (let pt of propertys) {
				if (this.event && this.event[eventSource] && this.event[eventSource][pt]) {
					ret = ret.set(pt, this.event[eventSource][pt]({
						path: eventSource,
						rowIndex: parsedPath.vars ? parsedPath.vars[0] : undefined
					}))
				}
			}
		}
		return ret
	}

	async asyncGetter(path, property) {
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
			getter: (path, propertys) => {
				return this.realAction.getter(path, propertys)
			},
			getterByField: (fieldPath) => {
				return this.realAction.getterByField(fieldPath)
			},
			asyncGetter: async(path, propertys) => {
				return await this.realAction.asyncGetter(path, property)
			},
			g:(path, propertys) => {
				return this.realAction.getter(path, propertys)
			},
			gf:(fieldPath) => {
				return this.realAction.getterByField(fieldPath)
			},
			ag:async(path, propertys) => {
				return await this.realAction.asyncGetter(path, property)
			}
		}
	}
}

export default function actionCreator(option) {
	const o = new action(option)
	return {
		g: o.getter,
		gf: o.getterByField,
		initView: o.initView,
		getter: o.getter,
		asyncGetter: o.asyncGetter,
		getterByField: o.getterByField,
		onEvent: o.onEvent,
		getDirectFuns: o.getDirectFuns
	}
}