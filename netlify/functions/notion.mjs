export const handler = async (evt) => {
	if (evt.httpMethod !== 'GET') {
		return { statusCode: 405, body: 'not allowed' }
	}

	const { code, state } = evt.queryStringParameters

	const resp = await fetch('https://api.notion.com/v1/oauth/token', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			authorization: `Basic ${process.env.NOTION_SECRET}`,
		},
		body: JSON.stringify({
			grant_type: 'authorization_code',
			code,
			redirect_uri: 'https://kotori-notion.netlify.app/callback'
		}),
	}).then((r) => r.json())

	const qs = new URLSearchParams({
		id: resp.bot_id,
		db: resp.duplicated_template_id,
		tk: resp.access_token,
		st: state,
	})

	return {
		statusCode: 302,
		headers: {
			'Location': `https://musakui.github.io/kotori-netlify/?_#${qs}`,
		},
	}
}
