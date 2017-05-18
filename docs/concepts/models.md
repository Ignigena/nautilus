# Models and ORM

Models are constructed through [Mongoose](http://mongoosejs.com) which
provides an ODM out of the box. Model definitions can be placed in the `/api`
directory and must have the suffix `.model.js`. Model schema can be configured
with the `schema` object and any options provided with an `options` object:

Here's a sample "User" model located in `api/user.model.js`:

```javascript
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

In this example, the model will be created at runtime and available at the app
object under `app.api.model.user` for querying in other controllers or services.
