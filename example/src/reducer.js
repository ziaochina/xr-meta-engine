import {
	Map
} from 'immutable'

import {
	reducer as r
} from '../../src'

import * as api from './api'

class reducer{
	constructor(option){
		this.baseReducer = new r(option)
	}

	init = (state, option) => {
		const data = {
			form: {
			}
		}
		return this.baseReducer.init(state, {
			data
		})
	}

	getRefs = () => {
		return this.baseReducer
	}
}


export default function creator(option){
	const o = new reducer(option)
	return {
		... o.getRefs(),
		... o
	}
}

