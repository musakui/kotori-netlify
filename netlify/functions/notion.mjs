import fetch from 'node-fetch'

export const handler = async (evt) => {
	if (evt.httpMethod !== 'GET') {
		return { statusCode: 405, body: 'not allowed' }
	}

	console.info(evt.queryStringParameters)

	const resp = await fetch('https://api.notion.com/v1/oauth/token', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			authorization: `Basic ${process.env.NOTION_SECRET}`,
		},
		body: JSON.stringify({
			grant_type: 'authorization_code',
			code: evt.queryStringParameters.code,
			redirect_uri: 'https://kotori-notion.netlify.app/callback'
		}),
	}).then((r) => r.json())

	console.info(resp)

	return { statusCode: 200, body: 'ok' }
}
