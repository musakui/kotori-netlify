import fetch from 'node-fetch'
import * as HS from '@musakui/fedi/hs'

HS.useFetch(fetch)

const cors = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET,POST',
	'Access-Control-Allow-Headers': 'Content-Type,Host,Date,Digest,Signature',
}

const handleError = (body, statusCode = 400) => ({
	statusCode,
	headers: cors,
	body,
})

const addPage = (obj, sender) => fetch('https://api.notion.com/v1/pages', {
	method: 'POST',
	headers: {
		'notion-version': '2022-06-28',
		'content-type': 'application/json',
		authorization: `Bearer ${process.env.NOTION_TOKEN}`,
	},
	body: JSON.stringify({
		parent: { database_id: process.env.NOTION_DATABASE },
		properties: {
			id: { url: obj?.id },
			type: { select: { name: obj?.type } },
			sender: { url: sender },
		},
	}),
}).then((r) => r.json())

export const handler = async (evt, ctx) => {
	const { httpMethod: method, path, headers, body } = evt
	if (method === 'OPTIONS') {
		return { statusCode: 204, headers: cors }
	} else if (method === 'GET' && ctx.clientContext.user) {
		console.info(method, path, headers)
		console.info(ctx)
		const resp = { status: 'ok' }
		return {
			statusCode: 200,
			headers: {
				...cors,
				'content-type': 'application/json',
			},
			body: JSON.stringify(resp),
		}
	} else if (method !== 'POST') {
		return handleError('not allowed', 405)
	}

	try {
		const sender = await HS.verifyRequest({ method, path, headers, body })
		console.log(sender, body)
		console.log(await addPage(JSON.parse(body), sender.id))
	} catch (err) {
		console.warn(err.message)
		console.info(body)
		console.info(headers)
		return handleError(`${err.message}`)
	}

	return { statusCode: 200, headers: cors, body: 'ok' }
}
