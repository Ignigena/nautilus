# Responses

Because Nautilus is built on top of Express you can access all the familiar methods and properties on the `res` object. Familiarize yourself with what's available in both [Express](https://expressjs.com/en/4x/api.html#res) and the underlying methods available in [Node's own response object](https://nodejs.org/api/http.html#http_class_http_serverresponse). Nautilus extends both with some syntactic sugar for sending responses semantically based on their human-readable reason phrase.

## Methods

Typically, in Express, sending a `404 - Not Found` response looks like:

```javascript
res.status(404).send('Not the Droids you are looking for.');
```

In Nautilus, the same response can achieved with:

```javascript
res.notFound('Not the Droids you are looking for.');
```

This same syntax can be used for most HTTP response types. Some of the more common responses you'll probably use include:

```javascript
res.ok(); // 200 - OK
res.created(); // 201 - Created
res.notModified(); // 304 - Not modified
res.badRequest(); // 400 - Bad request
res.unauthorized(); // 401 - Unauthorized
res.forbidden(); // 403 - Forbidden
res.notFound(); // 404 - Not found
res.serverError(); // 500 - Server error
```

All responses defined in RFC1945 (HTTP/1.0), RFC2616 (HTTP/1.1), RFC2518 (WebDAV), RFC6585 (Additional HTTP Status Codes), and RFC7538 (Permanent Redirect) are supported. For a full list of supported status codes see the [HTTP Status Codes](https://www.npmjs.com/package/http-status-codes#codes) module which Nautilus uses.

## Content-type

Nautilus will try to serve the appropriate `Content-Type` header based on both the data passed to the response and the client request headers.

?> If an object is passed to the response, JSON will always be returned rather than HTML.

Nautilus instructs Express to format all returned JSON with two spaces. This is done to provide a pleasant experience to humans who are interacting with your API since the size difference when properly gzipped is negligible. You can disable this behavior if desired by calling `app.set` with the `json spaces` property as described in the [Express documentation](https://expressjs.com/en/4x/api.html#app.set).

## Views

Certain responses can also be rendered using a server-side view. This is most useful when building sites other than an API where a graphical error page is desired. To enable view based rendering simply create a `responses` subfolder within your `views` directory with one or more of the 5 currently supported response types:

```
views
└─┬ responses/
  ├── badRequest.jts
  ├── unauthorized.jts
  ├── forbidden.jts
  ├── notFound.jts
  └── serverError.jts
```

Nautilus will recognize when templates have been created for these responses and serve them when the client accepts an HTML response.
