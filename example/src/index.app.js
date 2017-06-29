import * as metaComponents from './metaComponents'

module.exports = {
	name: 'example',
	version: '0.0.1',
	description: 'example',
	author: '',
	meta:getMeta(),
	metaComponents,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'))
		}, 'example')
	}
}


function getMeta(){
	return {
	  	name: 'root',
        component: 'Div',
        children:[{
        	name:'Input',
        	title3:'bbb',
        	title4:'$dddd',
        	component:'Input',
        	bindField:'form.col'
        },"ssss",{
        	name:'button',
        	component:'Button',
        	children:'fewfewfewfewfew'
        }]

	}
}
