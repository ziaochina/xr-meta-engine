import Immutable, {
	Map,
	List
} from 'immutable'

import * as util from './util'

class reducer {
	init(state, option){
		const {
			meta = {},
			data = {},
		} = option

		return this.initByImmutable(state, {
			meta: Immutable.fromJS(meta),
			data: Immutable.fromJS(data),
		})
	}

	initByImmutable(state, option) {
		const {
			meta,
			data,
		} = option

		//清除state中非@@开头的属性，那属性是xr-app-loader增加的
		const keys = []
		state.mapKeys(key => {
			if (key.indexOf('@@') === -1)
				keys.push(key)
		})

		keys.forEach(key => {
			state = state.remove(key)
		})

		//设置状态
		return state
			.set('meta', meta)
			.set('data', data)
			.set('parsedMeta', util.parseMeta(meta))
	}

	onEvent(eventName, option) {
		const {
			path
		} = option

		switch (eventName) {
			case 'onFieldFocus':
				return focus(state, path)
			case 'onFieldChange':
				return util.setter(state, path, 'value', option.newValue)
			default:
				return state
		}
	}

	focus(state, path) {
		return util.setter(state, 'meta', 'focusField', path)
	}

}


export default function actionCreator() {
	const o = new reducer()
	return {
		init: o.init,
		initByImmutable: o.initByImmutable,
		getter: util.getter,
		getterByField: util.getterByField,
		setter: util.setter,
		setterByField: util.setterByField,
		onEvent: o.onEvent,
		g:util.getter,
		gf:util.getterByField,
		s:util.setter,
		sf:util.setterByField
	}
}