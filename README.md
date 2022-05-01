# ActivityPub Inbox

> [ActivityPub](https://activitypub.rocks/) implementation using [Netlify Functions](https://functions.netlify.com/)

## Quick start

1. Generate an RSA private key

```sh
openssl genrsa -out private.pem 2048
```

then get the `private.pem` file as a single-line without the header and footer, e.g.

```
-----BEGIN RSA PRIVATE KEY-----
MIIE...
  ...
...AsDf==
-----END RSA PRIVATE KEY-----
```

becomes `MIIE.........AsDf==`

Keep this private key file safe, but the worst that could happen is someone impersonating your server.

2. Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/musakui/ActivityPub-inbox)

Paste the string from earlier in the private key field.

3. Clone the GitHub repository that was created and configure your payload handler in [handler.js](src/handler.js).

4. Choose your domain by changing the site name in the Netlify site settings.

5. Commit and push your changes to re-deploy the site at the new domain.

## Further reading

- [How to read ActivityPub](https://tinysubversions.com/notes/reading-activitypub/)
