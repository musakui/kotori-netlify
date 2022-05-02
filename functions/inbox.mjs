import fetch from 'node-fetch'
import * as HS from '@musakui/fedi/hs'
import { handlePayload } from '../src/handler.js'

const admin = process.env.ADMIN_USERNAME || 'admin'
const { origin } = new URL(process.env.URL)

HS.useFetch(fetch)
HS.useKey(`${origin}/u/${admin}#main-key`, `-----BEGIN RSA PRIVATE KEY-----
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
    const sender = await HS.verifyRequest({
      method,
      path: evt.path,
      body: evt.body,
      headers: evt.headers,
    })
    await handlePayload(JSON.parse(evt.body), sender)
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
