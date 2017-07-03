import {
	action as baseAction
} from '../../src'

import appInfo from './index.app'

class action {
	constructor(option){
		this.appInfo = option.appInfo
		this.init = this.init.bind(this)
		this.getMetaHanders = this.getMetaHanders.bind(this)
		this.baseAction = new baseAction({appInfo:this.appInfo, metaHandlers:this.getMetaHanders()})
	}

	init({component, injections}){
		this.component = component
		this.injections = injections
	}
	
	getMetaHanders(){
		return {
			init:this.init
		}
	}

	getReferenceAction(){
		return {
			...this.baseAction
		}
	}

}

export default creator(option){
	const o = new action(option)
	return {
		...o.getReferenceAction(),
		...o
	}
}
