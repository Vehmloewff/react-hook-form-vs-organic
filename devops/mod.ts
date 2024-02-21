import { dtils, frontier } from './deps.ts'

export async function dev() {
	await frontier.startPreviewServer({
		entry: new URL('../main.tsx', import.meta.url),
		reload: true,
		async template(headTags) {
			const text = await dtils.readText('devops/web.html')

			return text.replace('{head}', headTags)
		},
	})
}
