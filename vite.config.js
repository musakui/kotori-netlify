import { defineConfig } from 'vite'
import kotori from '@musakui/kotori/plugin'
import { toPEM, fromPrivate } from '@musakui/fedi/keys'

const url = process.env.URL

const admin = {
	isBot: true,
	manuallyApprovesFollowers: true,
	url,
	name: 'kotori on Netlify',
	summary: 'minimal ActivityPub instance. https://github.com/musakui/kotori-netlify',
	icon: { type: 'Image', mediaType: 'image/png', url: `${url}/icon.png` },
	inbox: '/inbox',
	published: new Date(),
	publicKey: fromPrivate(toPEM(process.env.AP_PRIVATE_KEY)),
}

export default defineConfig({
	plugins: [
		kotori({
			domain: url,
			profiles: {
				admin,
			},
			processHeaders: (h) => ({
				_headers: Object.entries(h).map(([fn, hs]) => `/${fn}\n${
					Object.entries(hs).map(([k, v]) => `  ${k}: ${v}`).join('\n')
				}\n`).join('\n'),
			}),
		}),
	],
	ssr: {
		noExternal: [
			'@musakui/*',
		],
	},
})
