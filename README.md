# kotori (using Netlify)

> [kotori](https://github.com/musakui/kotori) running on [Netlify Functions](https://functions.netlify.com/)

## Quick start

### 1. (optional) Connect with [Notion](https://notion.so)
Notion can be used to store your inbox activity.

You may choose to skip this step for now (and configure the environment variables on your own later).

To continue, follow the [Notion App authorization link]().
This will create a table using a template and generate a token for kotori to update that table.
You may proceed with the rest of the steps from there.

### 2. Generate a private key
Use `openssl` or the [generator utility](https://musakui.github.io/kotori-netlify/) to generate a private key

### 2. Deploy to Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/musakui/kotori-netlify)

### 3. Configure
Update the site url and tweak the configuration in your cloned repository

