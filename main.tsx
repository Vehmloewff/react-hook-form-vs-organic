import { initRouting, React, ReactDom, setupTheme } from './deps.ts'
import { Root as HookFormRoot } from './hook_form.tsx'
import { Root as OrganicRoot } from './organic.tsx'

initRouting()

setupTheme({
	pallette: {
		light: [255, 255, 255],
		dark: [33, 36, 43],
		primary: [12, 140, 233],
		secondary: [12, 140, 233],
		danger: [209, 63, 41],
		success: [37, 186, 0],
	},
})

const isHookForm = new URLSearchParams(location.search).get('hook-form') == 'true'

const root = ReactDom.createRoot(document.getElementById('root')!)

root.render(isHookForm ? <HookFormRoot /> : <OrganicRoot />)
