import Immutable, {
	Map,
	List
} from 'immutable'

import * as util from './util'

class reducer {
	init(state, option){
		const {
			data = {},
		} = option

		return this.initByImmutable(state, {
			data: Immutable.fromJS(data),
		})
	}

	initByImmutable(state, option) {
		const {
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
			.set('data', data)
	}

	onEvent(state, eventName, option) {
		const {
			path
		} = option

		switch (eventName) {
			case 'onFieldFocus':
				return focus(state, path)
			case 'onFieldChange':
				return util.setField(state, path, 'value', option.value)
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
		getMeta: util.getMeta,
		getField: util.getField,
		setMeta: util.setMeta,
		setField: util.setField,
		onEvent: o.onEvent,
		gm:util.getMeta,
		gf:util.getField,
		sm:util.setMeta,
		sf:util.setField
	}
}