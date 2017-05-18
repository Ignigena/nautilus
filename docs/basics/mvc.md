# MVC structure

The `/api` directory is where most of your application code will live, particularly your **Models** and **Controllers**. When creating your file structure, names are important and are used to automatically determine model names and a corresponding route structure for your controllers.

A simple application may have an `/api` directory that looks like:

```
api
├─┬ user/
│ ├── user.controller.js
│ └── user.model.js
└─┬ widget/
  ├── widget.controller.js
  └── widget.model.js
```

## Models

Models are defined with a `.model.js` file and can be used to instruct Mongoose how to set up the schema, validation and other configurable hooks.

!> For models to work a valid MongoDB connection URL must be configured at `config.connections.mongo.url`. This can be done with a file at `/config/connections.js` or by passing a configuration object at runtime.

When a model is created, a set of corresponding blueprint routes are created to set up basic CRUD operations. These exist even without a corresponding `.controller.js` file in the directory. Due to this, if you're building a RESTful API, many of your models may only require a Controller when special functionality is required.

## Views

Server-rendered views can be placed in a `/views` folder within your application directory. From a controller, simply call `res.render()` with the filename of the view and the values to pass to the template engine.

## Controllers

Controllers are the primary place to handle all the routing in your application. In a pure API, this is likely the **only** place you'll define routing.

The filename of the controller is used to determine it's root path. In the example above, we know from just looking at the file structure that our API has routes at `/user` and `/widget`. Each function that is exported from the `.controller.js` file is turned into a route based on the name of the function.
