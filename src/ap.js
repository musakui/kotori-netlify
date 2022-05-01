import { createSign, createVerify, createHash } from 'crypto'

let keyId = null
let signKey = null
let myFetch = null

const b64 = 'base64'
const requestTarget = '(request-target)'

const hashDigest = (d, algo = 'SHA-256') => {
  if (algo === 'SHA-256') return createHash('sha256').update(d).digest(b64)
  return null
}

export const sendSignedRequest = async (req) => {
  const url = new URL(req.url)
  const opts = { method: 'POST', headers: { ...req.headers } }

  if (req.body) {
    opts.body = JSON.stringify(req.body)
    opts.headers.digest = `SHA-256=${hashDigest(opts.body)}`
  } else {
    opts.method = 'GET'
  }

  const toSign = [
    requestTarget, 'host', 'date',
    ...(opts.body ? ['digest'] : []),
  ]
  const head = {
    [requestTarget]: `${opts.method.toLowerCase()} ${url.pathname}`,
    host: url.host,
    date: (new Date()).toUTCString(),
    ...opts.headers,
  }
  const data = toSign.map((h) => `${h}: ${head[h]}`).join('\n')
  const sig = createSign('sha256').update(data)

  opts.headers.date = head.date
  opts.headers.signature = Object.entries({
    algorithm: 'rsa-sha256',
    keyId,
    headers: toSign.join(' '),
    signature: sig.sign(signKey).toString(b64),
  }).map(([k, v]) => `${k}="${v}"`).join(',')

  const resp = await myFetch(req.url, opts)
  try {
    return await resp.json()
  } catch (err) {
    return await resp.text()
  }
}

export const getKey = async (url) => {
  try {
    const resp = await myFetch(url)
    return await resp.json()
  } catch (err) {
    return await sendSignedRequest({
      url,
      headers: { accept: 'application/json' },
    })
  }
}

export const verifySignedRequest = async (headers, body, target) => {
  if (!headers.signature) throw new Error('missing signature header')

  if (headers.date) {
    const evtDate = new Date(headers.date)
    const dt = Math.abs(new Date() - evtDate)
    if (!(dt < 1e5)) throw new Error(`invalid date: ${headers.date} (${dt})`)
  }

  const sig = Object.fromEntries(headers.signature.split(',').map((s) => {
    const [k, ...v] = s.split('=')
    return [k, v.join('=').replace(/(^"|"$)/g, '')]
  }))

  if (!sig.keyId || !sig.algorithm || !sig.headers || !sig.signature) {
    throw new Error(`invalid signature: ${headers.signature}`)
  }

  if (headers.digest) {
    const [ha, ...hd] = headers.digest.split('=')
    if (hd.join('=') !== hashDigest(body, ha)) {
      throw new Error(`invalid digest: ${headers.digest}`)
    }
  }

  const { publicKey: pk, ...rest } = await getKey(sig.keyId)

  if (!pk || !pk.publicKeyPem) {
    throw new Error(`failed to get key: ${sig.keyId}`)
  }

  if (pk.id && pk.id !== sig.keyId) {
    throw new Error(`invalid keyId: ${sig.keyId} != ${pk.id}`)
  }

  const veri = createVerify(sig.algorithm)
  veri.update(sig.headers.split(' ').map((h) => `${h}: ${
    h === requestTarget ? target : headers[h]
  }`).join('\n'))

  if (veri.verify(pk.publicKeyPem, sig.signature, b64)) return rest

  throw new Error('verification failed')
}

export const useKey = (id, key) => {
  keyId = id
  signKey = key
}

export const useFetch = (fn) => {
  myFetch = fn
}
