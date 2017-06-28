import React, {
	Component
} from 'react'

import {
	wrapper,
} from '../../src'

import appInfo from './index.app'

@wrapper(appInfo)
export default class exampleComponent extends Component {

	render() {
		return  this.props.monkeyKing({...this.props, path:'root'})
	}
}