# Nautilus

> Convention over configuration framework for Express.

## What is it

The purpose of Nautilus is to provide a convention over configuration structure
around an Express application to allow better maintainability and rapid
prototyping of new apps.

While Nautilus is opinionated and borrows heavily from the conventions of other
Express frameworks, there are a few things that it aims to do differently:

* **Wrap, don't re-invent.** Wherever possible Nautilus will only wrap existing
  libraries and conventions rather than forcing an arbitrary new one that we
  think you should follow.
* **Don't bury the core in abstraction.** In any hook you have access to the
  core Express application. It's not the "Nautilus" version of Express, it's
  just Express pure and simple. We're not trying to obscure Node and Express
  features that you already know and love, but rather give you a framework and
  remove some of the repetitive code you may typically write.
* **A starting point, not a comprehensive solution.** You will still need to
  know how to Express to make a full application. Hopefully this just makes it
  a little bit easier!

## Stack overview

* [Express](http://expressjs.com) for the web stuff
* [Socket.io](http://socket.io) for real-time communication
* [Mongoose](http://mongoosejs.com) for models and ODM in MongoDB
* [JTS](https://github.com/Ignigena/jts) for fast, minimal server-side templates
* [Lusca](http://github.com/krakenjs/lusca) for security middleware
* [Winston](http://github.com/winstonjs/winston) for logging
