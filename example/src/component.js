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
		return (<div>{this.props.gf('form.col')}</div>)
	}
}