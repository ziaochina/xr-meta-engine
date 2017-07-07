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

//:: react element
//$$ action function
//$= exec action function
//%= state value

function getMeta() {
	return {
		name: 'root',
		component: '::div',
		children: [{
			name: 'hello',
			component: 'Hello',
		}, {
			name: 'userLabel',
			component: '::span',
			children: 'user:',
			_visible: '{{data.isLogin !== true}}'
		}, {
			name: 'user',
			component: '::input',
			value: '{{data.form.user}}',
			onChange: "{{ (e) => $setField('data.form.user', e.target.value ) }}",
			_visible: '{{$isLogin() === false}}'
		}, {
			name: 'pwdLabel',
			component: '::span',
			children: 'password:',
			_visible: '{{data.isLogin !== true}}'
		}, {
			name: 'password',
			component: '::input',
			type: 'password',
			value: '{{data.form.password}}',
			onChange: "{{ (e) => $setField('data.form.password', e.target.value ) }}",
			_visible: '{{$isLogin() === false}}'
		}, {
			name: 'button',
			component: '::button',
			children: 'login',
			onClick: '{{$login}}',
			_visible: '{{$isLogin() === false}}'
		}, {
			name: 'welcome',
			component: '::div',
			children: 'welcome',
			_visible: '{{$isLogin()}}'
		}, {
			name: 'logout',
			component: '::button',
			children: 'logout',
			onClick: '{{$logout}}',
			_visible: '{{$isLogin()}}'
		},
		{
			name: 'span',
			component: '::span',
			children: "{{data.details[_rowIndex]}}",
			_power: 'for in data.details'
		}]

	}
}