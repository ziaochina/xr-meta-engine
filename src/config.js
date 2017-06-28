import {
	config as appLoaderConfig
} from 'xr-app-loader'

import cf from './componentFactory'

export default function config(option) {
	const {
		components
	} = option

	appLoaderConfig(option)

	if (!components || components.length == 0)
		return

	components.forEach(c => {
		if (c.appName)
			cf.registerComponent(c.appName, c.name, c.component)

		else
			cf.registerComponent(c.name, c.component)
	})
}