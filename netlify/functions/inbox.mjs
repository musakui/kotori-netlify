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

const txt = (content) => [{ text: { content } }]

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
			title: { title: txt(obj.type) },
			id: { url: obj.id },
			type: { select: { name: obj.type } },
			actor: { url: obj.actor },
			sender: { url: sender },
		},
		children: [
			{
				object: 'block',
				code: {
					language: 'json',
					caption: txt('payload'),
					rich_text: txt(JSON.stringify(obj, null, 2)),
				},
			},
		],
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
		console.log(body)
		console.log(await addPage(JSON.parse(body), sender.id))
	} catch (err) {
		if (err.code === 'KEY_RETRIEVAL_FAILED' && JSON.parse(body).type === 'Delete') {
			return { statusCode: 200, body: 'ok' }
		}
		console.warn(err.message)
		console.info(body)
		console.info(headers)
		return handleError(`${err.message}`)
	}

	return { statusCode: 200, headers: cors, body: 'ok' }
}
