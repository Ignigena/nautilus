# Hook system

Hooks are the building blocks used to create a Nautilus application. In fact, the core of Nautilus itself uses the same hook system to build itself before creating your application.

At the core of Nautilus is an `app` object. This object is simply passed around from hook to hook until all have been loaded. A hook typically extends or modifies the `app` object by either creating a new name-spaced service or calling a previously loaded one.

## Load order

By default, hooks are loaded alphabetically. If portions of a hook require another to be loaded, a lifecycle callback can be used which will run immediately if the dependent hook is already loaded or delay execution until it has:

```javascript
app.hooks.after('core:views', () => {
  // The core hook "views" has been loaded.
});
```

Each hook has it's own namespace based on the type of hook. A typical Nautilus application will have `core` hooks representing those within the framework and `custom` hooks representing the application level.

In cases where a specific order is required, the weight of a hook can be modified by setting a positive or negative numeric value on the `order` prototype property.
