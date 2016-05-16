# Nautilus

The purpose of Nautilus is to provide a basic structure around an Express
application to allow better maintainability and rapid prototyping of new apps.

While Nautilus is opinionated and borrows heavily from the conventions of other
Express frameworks, there are a few things that it aims to do differently:

* **Wrap, don't re-invent.** Wherever possible Nautilus will only wrap existing
  libraries and conventions rather than forcing an arbitrary new one that we
  think you should follow.
* **Don't bury the core in abstraction.** In any hook you have access to the
  core Express application. It's not the "Nautilus" version of Express, it's
  just Express pure and simple.
* **A starting point, not a comprehensive solution.** You will still need to
  know how to Express to make a full application. Hopefully this just makes it
  a little bit easier!

## Stack overview

* [Express](http://expressjs.com) for the web stuff
* [Socket.io](http://socket.io) for real-time communication
* [Mongoose](http://mongoosejs.com) for models and ORM in MongoDB
* [JTS](https://github.com/Ignigena/jts) for fast, minimal server-side templates
* [Lusca](http://github.com/krakenjs/lusca) for security middleware
* [Winston](http://github.com/winstonjs/winston) for logging

## Getting started

### Configuration

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

Finally, a `config/local.js` file can be created and excluded from GIT which
will override all other configuration including environment. This is useful for
local development when a number of settings need to be overwritten temporarily.

### Security

Security is provided by the [Lusca](http://github.com/krakenjs/lusca) module and
can be configured through `config/security.js`.

### Routes

Work in progress.

### Models and ORM

Models are constructed through [Mongoose](http://mongoosejs.com) which also
provides an ORM out of the box. Model definitions can be placed in the `/api`
directory and must have the suffix `.model.js`. Model schema can be configured
with the `schema` object and any options provided with an `options` object:

Here's a sample "User" model located in `api/user.model.js`:

```
module.exports = {
  schema: {
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Valid email address required']
    },
    name: String,
    password: {
      type: 'string',
      match: [/((?=.*\d)(?=.*[a-zA-Z]).{6,20})/, 'Secure password required']
    },
  }
};
```

In this example, the model will be created at runtime and available as the
superglobal `User` for querying in other controllers or services.

### Templates

Server side templates by default use the [JTS](https://github.com/Ignigena/jts)
module. This is an extremely lightweight and minimal server-side template
engine which uses Javascript template strings available in ES6.

This can be overridden in your application by customizing `config/views.js`.
