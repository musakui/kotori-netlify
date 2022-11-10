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
		console.info(method, path, headers)
		console.info(body)
	} catch (err) {
		console.warn(err.message)
		console.info(body)
		console.info(headers)
		return handleError(`${err.message}`)
	}

	return { statusCode: 200, headers: cors, body: 'ok' }
}
