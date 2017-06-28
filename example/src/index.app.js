import * as metaComponents from './metaComponents'

module.exports = {
	name: 'example',
	version: '0.0.1',
	description: 'example',
	author: '',
	metaComponents,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'))
		}, 'example')
	}
}