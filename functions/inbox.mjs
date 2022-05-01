import fetch from 'node-fetch'
import * as AP from '../src/ap.js'
import { handlePayload } from '../src/handler.js'

const username = process.env.ADMIN_USERNAME || 'admin'
const { origin } = new URL(process.env.URL)

AP.useFetch(fetch)
AP.useKey(`${origin}/u/${username}#main-key`, `-----BEGIN RSA PRIVATE KEY-----
${process.env.AP_PRIVATE_KEY}
-----END RSA PRIVATE KEY-----`)

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST',
  'Access-Control-Allow-Headers': 'Content-Type,Host,Date,Digest,Signature',
}

export const handler = async (evt, ctx) => {
  const method = evt.httpMethod
  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: cors,
    }
  } else if (method !== 'POST') {
    return {
      statusCode: 405,
      headers: cors,
      body: 'not allowed',
    }
  }

  try {
    const target = `${method} ${evt.path}`.toLowerCase()
    const sender = await AP.verifySignedRequest(evt.headers, evt.body, target)
    const { '@context': _, ...payload } = JSON.parse(evt.body)
    await handlePayload(payload, sender)
  } catch (err) {
    console.log(evt.body)
    console.log(evt.headers)
    console.warn(err.message)
    return {
      statusCode: 400,
      headers: cors,
      body: `${err.message}`,
    }
  }

  return {
    statusCode: 200,
    headers: cors,
    body: 'ok',
  }
}
