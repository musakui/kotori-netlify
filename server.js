import { handleInbox } from '@musakui/kotori/handler'

const cors = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET,POST',
	'Access-Control-Allow-Headers': 'Content-Type,Host,Date,Digest,Signature',
}

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

export const inboxHandler = async (evt, ctx) => {
	const { httpMethod: method, path, headers, body } = evt
	if (method === 'OPTIONS') {
		return { statusCode: 204, headers: cors }
	} else if (method === 'GET') {
		if (!ctx.clientContext.user) {
			return { statusCode: 401, body: 'unauthorized' }
		}
		const { email } = ctx.clientContext.user
		const resp = { status: 'ok', email }
		return {
			statusCode: 200,
			headers: {
				...cors,
				'content-type': 'application/json',
			},
			body: JSON.stringify(resp),
		}
	} else if (method !== 'POST') {
		return { statusCode: 405, body: 'not allowed' }
	}

	try {
		const req = await handleInbox(method, path, headers, body)
		if (req) {
			console.log(body)
			console.log(await addPage(req.activity, req.sender))
		}
	} catch (err) {
		console.warn(err.message)
		console.info(body)
		console.info(headers)
		return { statusCode: 400, body: `${err.message}` }
	}

	return { statusCode: 200, headers: cors, body: 'ok' }
}
