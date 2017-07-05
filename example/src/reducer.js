import { Map } from 'immutable'

import { reducer as MetaReducer } from '../../src'

import * as api from './api'

class reducer {
	
	constructor(option){
		this.metaReducer = option.metaReducer
	}

	init = (state, option) => {
		
		const data = {
			form: {
				user:'1',
				password:'1'
			}
		}

		return this.metaReducer.init(state, {data})
	}
}


export default function creator(option){
	const metaReducer = new MetaReducer(option),
		o = new reducer({...option, metaReducer})

	return {...metaReducer, ... o}
}

