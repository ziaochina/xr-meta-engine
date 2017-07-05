import {
	config as appLoaderConfig
} from 'xr-app-loader'

import cf from './componentFactory'

var toast, notification, modal

function config(option) {
	const components = option.components

	toast = option.toast
	notification = option.notification
	modal = option.modal

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

config.toast = toast
config.notification = notification
config.modal = modal

export default config