import React from 'react'
import {
	config,
	start,
	componentFactory
} from '../src'

import _src from './src/index.app'

config({
	apps: {
		[_src.name]: _src
	},
	targetDomId:'app',
	startAppName:'example'
})


Object.keys(_src.metaComponents).forEach(key=>{
	const ccc = _src.metaComponents

	debugger
	componentFactory.registerAppComponent(_src.name, key, _src.metaComponents[key])
})

start()