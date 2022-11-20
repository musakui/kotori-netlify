import { createPublicKey } from 'crypto'
import { defineConfig } from 'vite'
import kotori from '@musakui/kotori/plugin'

const admin = process.env.ADMIN_USERNAME || 'admin'

const privateKey = `-----BEGIN PRIVATE KEY-----
${process.env.AP_PRIVATE_KEY}
-----END PRIVATE KEY-----`

const publicKey = createPublicKey({ key: privateKey }).export({ format: 'pem', type: 'spki' })

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
})
