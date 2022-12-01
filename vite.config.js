import { defineConfig } from 'vite'
import kotori from '@musakui/kotori/plugin'
import { toPEM, fromPrivate } from '@musakui/fedi/keys'

const admin = process.env.ADMIN_USERNAME || 'admin'

const publicKey = fromPrivate(toPEM(process.env.AP_PRIVATE_KEY))

export default defineConfig({
	plugins: [
		kotori({
			domain: process.env.URL,
			profiles: {
				[admin]: {
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
