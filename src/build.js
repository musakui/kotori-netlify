import { createPublicKey } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'

const publishDir = 'dist'
const wfDir = `${publishDir}/webfinger`
const userDir = `${publishDir}/u`

const username = process.env.ADMIN_USERNAME || 'admin'
const { origin, hostname } = new URL(process.env.URL)

const privateKey = `-----BEGIN RSA PRIVATE KEY-----
${process.env.AP_PRIVATE_KEY}
-----END RSA PRIVATE KEY-----`
const pubKey = createPublicKey({ format: 'pem', key: privateKey })

const actor = {
  id: `${origin}/u/${username}`,
  type: 'Application',
  preferredUsername: username,
  manuallyApprovesFollowers: true,
  published: (new Date()).toISOString(),
  inbox: `${origin}/inbox`,
}

const subject = `acct:${username}@${hostname}`
const links = [{
  rel: 'self',
  type: 'application/activity+json',
  href: actor.id,
}]

await mkdir(wfDir, { recursive: true })
await mkdir(userDir, { recursive: true })

await writeFile(`${wfDir}/${subject}`, JSON.stringify({
  subject,
  links,
}))

await writeFile(`${userDir}/${username}`, JSON.stringify({
  '@context': [
    'https://www.w3.org/ns/activitystreams',
    'https://w3id.org/security/v1',
  ],
  ...actor,
  publicKey: {
    id: `${actor.id}#main-key`,
    owner: actor.id,
    publicKeyPem: pubKey.export({ format: 'pem', type: 'spki' }),
  },
}))
