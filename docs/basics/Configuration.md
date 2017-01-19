# Configuration

Every default in Nautilus can be customized through the global configuration
object. In turn, as you build your application you should use this same
configuration wherever possible especially anywhere sensitive data is stored.

Configuration can be set by creating new files in your `config` folder. The name
of this file will become the key where you access the configuration data. In
most cases, configuration for built-in hooks share the name of the hook.

For example, to override the configuration for the `log` hook you might create
a new file at `config/log.js` to override the default logging level in Winston:

```
module.exports = {
  level: 'verbose',
}
```

## Priority levels

There are several levels of configuration, each treated with an increasing level
of priority. Higher priority configuration will replace lower priority
configuration. In this way, the configuration of your application is adjusted
automatically depending on the environment it's deployed in.

We'll cover each level in order from lowest to highest priority:

#### Core hook defaults

Each core hook has it's own default configuration. The goal here is to provide
complete functionality without having to write a single configuration file
yourself. This is the lowest priority configuration and will be overridden by
any local or environment settings.

#### Standard configuration

User provided configuration can be accessed at the `app.config` object. Each
top-level key corresponds with a file located in your `/config` directory.
Generally, core hooks will look for configuration files which match their name.

#### Environment-specific configuration

Standard configuration will be overwritten with environment-specific values
which are located in the `config/env` directory. The name of the file should
match the value of `process.env.NODE_ENV`.

For example, a server run with `NODE_ENV=production npm start` will prefer
configuration in the `config/env/production.js` file above all others.

This is useful when a large amount of configuration should change between
development and production environments.

#### Local development configuration

A `config/local.js` file can be created and excluded from GIT which will
override all other configuration including environment. This is useful for local
development when a number of settings need to be overwritten temporarily.

#### Runtime configuration

The topmost priority of configuration is present in the runtime configuration.
This can be useful when creating unit tests where specific functionality needs
to be present despite the contents of the `config` directory.

Runtime configuration can be passed in an object when creating the Nautilus
instance. For example, to disable the session hook globally:

```
new Nautilus({
 session: false
});
```

## Sensitive data

Any sensitive data including private API keys or database connection strings
should be kept out of version control. Best practice is to reference an
environment variable that can be encrypted on your deployment platform and
passed to the running application. For example, configuration for your Mongo
connection might look as follows in `config/connections.js`:

```
module.exports = {
  mongo: {
    url: process.env.DB_MONGO,
    mongos: {
      ssl: true
    }
  }
};
```

When running your application locally, take advantage of your
`config/env/local.js` file to store the actual URL of your Mongo instance. The
benefit here is that you don't have to worry about one of your developers
accidentally committing the connection string to version control.
