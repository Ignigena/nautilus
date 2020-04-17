# @nautilus/config

Environment-aware loader designed to bring convention to your configuration.

Storing configuration separate from the code is one of the [Twelve-Factor App](https://12factor.net/config) principles. This module makes it easier for you to observe best practices around configuration while keeping organization as your project grows.

While sensitive environment variables should always be stored as `process.env` values in Node, there are many other things which qualify as configuration that either don't change between environments, or aren't sensitive enough to obscure from source control.

With a consistent convention for your configuration, you can maintain good separation of application and configuration values without overusing `process.env`.

## Basic usage

Configuration is loaded from a directory, typically `config` at the root of your project. Each file in the directory is loaded with `require` and the file name is used to namespace the configuration values.

Additionally, an `env` directory is supported inside of `config`. Each environment can be represented here as a single file which will take priority over any previously-determined configuration values.

```
const config = require('@nautilus/config')('./config')
```

Given the following directory structure:

```
config
├── env
│   ├── development.js
│   ├── local.js
│   └── production.js
├── db.js
├── clients.js
└── security.js
```

The resulting configuration object will be shaped as:

```
{
  db: {},
  clients: {},
  security: {}
}
```

## Environment configuration

Environment configuration is based on `process.env` values when the configuration is loaded. For simple setups, `process.env.NODE_ENV` can be used to give you a `production` value in your deployment and a `development` value locally. For more advanced needs, `process.env.DEPLOY_ENV` can be used with any number of values in order to leave `NODE_ENV` untouched for CI purposes.

If the current environment cannot be determined, `development` is used by default.

Environment configuration should be structured as a single file since it will be merged over the top of the base configuration object that is built.

Given the base configuration located at `env/db.js`:

```js
module.exports = {
  host: 'atlas.mongodb.com',
  poolSize: 10,
  ssl: true
}
```

Your environment configuration should be structured as follows:

```js
module.exports = {
  db: {
    host: 'beta.mongodb.com'
  }
}
```

Which results in the following configuration:

```
{
  db: {
    host: 'beta.mongodb.com',
    poolSize: 10,
    ssl: true
  }
}
```

### Local development

If a file exists at `env/local.js` it will take precedence over any environment configuration that is loaded. This file should be excluded from source control and will allow you to quickly change configuration during development without modifying files that are committed to source control.

## Sensitive data

Any sensitive data including private API keys or credentials should be kept out of version control. This should be done whether or not your repo is public to mitigate the risk of compromising any credentials.

Best practice is to reference an environment variable that can be encrypted on your deployment platform and passed to the running application. For example, configuration for your Mongo connection might look as follows in `config/db.js`:

```js
module.exports = {
  host: 'atlas.mongodb.com',
  username: process.env.MONGO_USER,
  password: process.env.MONGO_PASS
}
```

When running your application locally, take advantage of your `config/env/local.js` file to store the actual username and password. The benefit here is that you don't have to worry about accidentally committing sensitive data to version control.

## Optional `dotenv` integration

If the `dotenv` package is installed it will be used to populate your `process.env` values. This is to facilitate compatibility with development flows that include the creation of a `.env` file such as ZEIT's Now platform.

You may continue using `local.js` to override values during local development but you will get the added benefit of having these values populated "for free" if you are using `now dev` or `now secrets pull`.

If you aren't using `dotenv`, it is not required as a dependency. It is recommended that you use the file structures outlined above to organize your secrets and environment overrides.
