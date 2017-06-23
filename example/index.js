import {
	config,
	start,
} from '../src'

import _src from './src/index.app'

config({
	apps: {
		[_src.name]: _src
	},
	targetDomId:'app',
	startAppName:'example'
})

start()