# Policies

Policies can be thought of as route specific middleware and are used to control
access to one or more API endpoints based on the request. Policies are created
and placed in the `api/policies` folder and can be configured at the namespace
`app.config.policies`.

## Writing a policy

Policies are written in the same way as traditional Express middleware. As an
example, below is a simple permission-checking policy:

```js
module.exports = (req, res, next) => {
  if (!req.authorization || !req.authorization.permission) {
    return res.unauthorized();
  }

  if (req.authorization.permission !== 'admin') {
    return res.unauthorized();
  }

  next();
};
```

It is best practice to "fail quickly" in your policy to ensure quick execution
as the application grows and more middleware layers are introduced. As with all
Express middleware make sure you call `next()` otherwise your request will hang.

## Applying a policy

Policies can be configured at the `app.config.policies` namespace and consist of
a keyed object representing the paths and corresponding policies. We'll break down
the following example configuration located in `config/policies.js`:

```js
module.exports = {
  '*': false,
  '/user/register': true,
  '/widget': ['authenticated', {
    name: 'isAdmin',
    methods: ['POST', 'PUT', 'DELETE']
  }],
};
```

### Default policies

It is best practice to add a root policy with a high level of restrictions to
avoid unprotected routes (particularly blueprints) from being exposed in
production. This is done with the `*` or `default` key which in the example
above we've denied any access with `false`. Default policies are at the lowest
level of the stack and will be overridden with any other policy.

### Whitelist / blacklist

Routes can be whitelisted by setting `true` on their policy configuration. This
exists at the highest level of the stack and even if further restrictions are
added in other matched policies, they will be ignored and the policy will always
be skipped.

Blacklisting works in the opposite way and always exists at the lowest layer of
the stack. This permits blacklisting a large number of paths which are then
stripped away by more granular permissions.

### Named policies

Routes can be protected with named policies. This can take the form of a string
or an array of multiple named policies. When an array is used, the policies are
traversed in order from left to right before the request is fulfilled.

The name of the policy should match the filename used in the `api/policies`
directory for the policy you wish to use.

### Method restriction

Policies can be further restricted by their request method on a per-route basis.
This can be helpful when tiered permissions need to be enforced on a RESTful
route. For instance, if only an admin is allowed to create or delete an object
but a registered user can get and modify the same object.

In this case, an object can be provided instead of the named string. This object
should contain the name of the policy and all request methods this policy should
be applied on. If a request method is used that is not contained in this array,
the policy will be skipped and the next policy will be applied.
