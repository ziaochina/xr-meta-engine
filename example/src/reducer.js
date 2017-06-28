import {
	Map
} from 'immutable'

import {
	reducer
} from '../../src'

import * as api from './api'

import appInfo from './index.app'

const _r = reducer(appInfo)

export function init(state, option) {
	const meta = api.getMeta(),
		data = {
			form: {
				col: '111'
			}
		}
	return _r.init(state, {
		meta,
		data
	})
}


Object.assign(exports, {..._r,
	...exports
})