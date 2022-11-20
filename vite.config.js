import { defineConfig } from 'vite'
import kotori from '@musakui/kotori/plugin'
import { toPEM, fromPrivate } from '@musakui/fedi/keys'

const publicKey = fromPrivate(toPEM(process.env.AP_PRIVATE_KEY))

export default defineConfig({
	plugins: [
		kotori({
			domain: process.env.URL,
			profiles: {
				admin: {
					isBot: true,
					manuallyApprovesFollowers: true,
					url: 'https://github.com/musakui/kotori-netlify',
					published: new Date(),
					inbox: '/inbox',
					publicKey,
				},
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
