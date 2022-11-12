export const handler = async (evt) => {
	if (evt.httpMethod !== 'GET') {
		return { statusCode: 405, body: 'not allowed' }
	}

	console.info(evt)

	return { statusCode: 200, body: 'ok' }
}
