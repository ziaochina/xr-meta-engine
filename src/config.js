import {config as appLoaderConfig} from 'xr-app-loader'
import cf from './componentFactory'

export default function config(option) {
	const {
		components
	} = option

	cf.registerComponents(components)
	appLoaderConfig(option)
}