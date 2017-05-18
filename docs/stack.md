# Stack overview

* [Express](http://expressjs.com) for the web stuff
* [Socket.io](http://socket.io) for real-time communication
* [Mongoose](http://mongoosejs.com) for models and ODM in MongoDB
* [JTS](https://github.com/Ignigena/jts) for fast, minimal server-side templates
* [Lusca](http://github.com/krakenjs/lusca) for security middleware
* [Winston](http://github.com/winstonjs/winston) for logging

## Express

Nautilus uses [Express 4](https://expressjs.com) at the core which is itself a minimalist framework built on top of the features built into Node.js core. It is built as a thin layer of features.

One of the biggest benefits of using Express is the large community of modules and middleware that are built for Express. As a result, any Express module is also compatible with Nautilus with very little or no special configuration required.

A core philosophy of Nautilus is structuring everything around an `app` object. With Express at the core, this `app` object also represents your Express instance which can be modified or configured at-will through the use of configuration and hooks.

## Websockets

[Socket.io](http://socket.io) is available by default in a new Nautilus application. You may access the Socket.io instance at `app.io` in any hook, controller, or model.

### MongoDB

For your MongoDB models, validation, and query building, [Mongoose](http://mongoosejs.com) is included in Nautilus.

Models can be configured within the `/api` directory in your application. Any file with the extension `.model.js` will be picked up by Nautilus and run through Mongoose to create a model. Afterwards, this model and all the functionality of Mongoose queries are available by calling `app.model()`.

## Server Templates

Using ES6 template literals in Javascript is extremely performant in Node. Rather than using a full-featured template engine in Nautilus, we include the [JTS module](https://www.npmjs.com/package/jts) which relies entirely on ES6 literals.

Typically a template would have to be parsed for special tokens which the template engine can replace at runtime. This can be slow with large files or complex templates. What JTS lacks in features, it [makes up for in speed](https://github.com/Ignigena/jts/blob/master/benchmark/README.md) since it simply loads your template file as a template literal.


## Security

Most of the basic security needs for an Express server are provided by the [Lusca module](https://www.npmjs.com/package/lusca) and the [CORS middleware](https://www.npmjs.com/package/cors). More advanced configuration can be adjusted but a standard set of defaults are included.

## Logging

[Winston](http://github.com/winstonjs/winston) was chosen as the logging module due to it's highly configurable nature. In it's most basic form, various levels of logging are available and can be suppressed in configured environments (hiding verbose logs in Production). More advanced configuration is possible to support multiple logging endpoint and even file-based logging.
