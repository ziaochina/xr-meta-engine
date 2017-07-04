import * as metaComponents from './metaComponents'

module.exports = {
	name: 'example',
	version: '0.0.1',
	description: 'example',
	author: '',
	meta: getMeta(),
	metaComponents,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'))
		}, 'example')
	}
}


function getMeta() {
	return {
		name: 'root',
		component: '_div',
		children: [{
				name: 'hello',
				component: 'Hello',
			},
			'user:', {
				name: 'user',
				component: '_input',
				value: '##form.user',
				onChange: 'args[0].target.value->form.user'
			}, 'password:', {
				name: 'password',
				component: '_input',
				type: 'password',
				value: '##form.password',
				onChange: 'args[0].target.value->form.password'
			}, {
				name: 'button',
				component: '_button',
				children: 'login',
				onClick: '$$login'
			},
		]

	}
}