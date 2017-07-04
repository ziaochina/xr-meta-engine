import {
	action as a
} from '../../src'

class action {
	constructor(option){
		this.appInfo = option.appInfo
		this.baseAction = new a({appInfo:this.appInfo, metaHandlers:this.getMetaHanders()})
	}

	onInit = ({component, injections}) =>{
		this.component = component
		this.injections = injections
		injections.reduce('init')
	}

	login = () => {
		console.log(this.baseAction.gf('form.user'), this.baseAction.gf('form.password'))
	}
	
	getMetaHanders = () =>{
		return {
			onInit:this.onInit,
			login: this.login
		}
	}

	getRefs = () =>{
		return this.baseAction
	}
}

export default function creator(option){
	const o = new action(option)
	return {
		...o.getRefs(),
		...o
	}
}
