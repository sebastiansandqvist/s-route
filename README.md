# s-router

A client-side router that calls functions when a matching route is hit

For use with single-page applications

### Example

```js
import { Router, setPath } from 's-router';
import parseQueryString from 's-router/querystring';

function rootRouted() {
	// do something to show root page content
}

function messagesRouted() {
	// do something to show messages page content
}

function messageRouted({ path, route, params, hash, search }) {
	// should do something to show message page content here,
	// but this example shows the different properties available
	// to route handler functions
	assert.equal(path, '/messages/123');
	assert.equal(route, '/messages/:id');
	assert.deepEqual(params, { id: '123' });
	assert.equal(hash, '');
	assert.deepEqual(parseQueryString(search), { foo: 'bar' });
}

function noneRouted() {
	// handle 404
}

Router({
	'/': rootRouted,
	'/messages': messagesRouted,
	'/messages/:id': messageRouted,
	'*': noneRouted
});

// this will cause the router to trigger `messageRouted()`
setPath('/messages/123?foo=bar');
```

### Installation

```bash
npm install --save s-router
```

Using a module bundler such as [rollup](http://rollupjs.org), [webpack](https://webpack.github.io/), or [browserify](http://browserify.org/) you can then import `s-router`.

```js
// if using an es6 transpiler, like babel or buble
import { Router } from 's-router';
```

```js
// if not using an es6 transpiler, use the already-transpiled UMD version instead
var Router = require('s-router/bundle').Router;
var setPath = require('s-router/bundle').setPath;
```

A server-side setup that routes all traffic to the same html file will also be required.

<details>
<summary>**Setup for Express Server**</summary>
```js
const express = require('express');

const app = express();

// ensure static files can be accessed (these are not handled by the clientside router)
app.use('/public', express.static(__dirname + '/public'));

// route all requests to index.html
app.get('*', (req, res) => res.sendFile(__dirname + '/index.html'));
app.listen(process.env.PORT || 3000);
```	
</details>

<details>
<summary>**Setup for Firebase Hosting**</summary>
In firebase.json, assuming static files are located in `/public`

```json
{
  "hosting": {
    "public": "public",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "trailingSlash": false,
    "cleanUrls": true
  }
}
```	
</details>

### Defining routes

Routes here do not correspond to specific components as they do in many clientside routers, such as react-router and vue-router. Instead, when the user navigates, `s-router` calls the function associated with each url.

The route map is just an object where the keys are a pattern to match against the url and the values are functions to be called when a matching url has been navigated to.

##### Simple example:

```js
Router({
	'/foo': () => console.log('Foo page routed'),
	'*': () => console.log('Catch-all routed')
});
```

When the user navigates to `/foo`, `'Foo page routed'` will have been logged to the console. When the user navigates to `/bar`, `'Catch-all routed'` will have been logged because no pattern in the route map corresponds to `/bar`.

##### Routes with parameters (dynamic routes):

```js
Router({
	'/messages/:id': (routeData) => console.log(routeData.params),
	'*': () => console.log('Catch-all routed')
});
```

Sections of a route that begin with a colon `:` will match any value that appears in that part of the path. For instance, in this case, `/messages/:id` would match any of the following routes (and many more):

- `/messages/123`
- `/messages/456`
- `/messages/foo`

It would *not* match the following routes:

- `/messages`
- `/messages/123/456`

All route handlers are passed an object of route data with the following properties:

| Property     | Type     | Description   |
| ------------ | -------- | ------------- |
| `path`       | String   | The path of the route as it appears in the address bar, eg: `'/messages/123'` (same as `window.location.pathname`) |
| `route`      | String   | The route that was matched against, eg: `'/messages/:id'`. This will be `'*'` if the catch-all route was matched. |
| `search`     | String   | The raw query string (same as `window.location.search`) |
| `hash`       | String   | The raw hash (same as `window.location.hash`) |
| `params`     | Object   | Parameters that were matched in a dynamic route, eg: `{ id: '123' }` (empty object if none). The parameters will always be strings. |


### `setPath`

When routing within a single-page application, you should use the provided `setPath` function rather than manually setting `window.location.href` or using other methods that cause a refresh. `setPath('/foo')` will add `/foo` to the browser history and trigger the corresponding route handler without refreshing the page.

```js
import { setPath } from 's-router';

// after router has been initialized...

const button = document.getElementById('foo-button');
button.onclick = () => setPath('/foo');
```


### Query string parsing

Support for parsing query strings is not included in `s-router` by default, but can be imported separately.

```js
import parseQueryString from 's-router/querystring';

// in real code, you would probably get this value from `window.location.search`
const query = '?foo=bar&baz=qux';

assert.deepEqual(parseQueryString(query), {
	foo: 'bar',
	baz: 'qux'
});
```

If the same key is assigned more than one value, it is assumed to be an array.

```js
import parseQueryString from 's-router/querystring';

const query = '?foo=bar&foo=baz';

assert.deepEqual(parseQueryString(query), {
	foo: ['bar', 'baz']
});
```

If the key ends in `[]`, it is also assumed to be an array.

```js
import parseQueryString from 's-router/querystring';

const query = '?foo[]=bar';

assert.deepEqual(parseQueryString(query), {
	foo: ['bar']
});
```

All values are assumed to be strings, unless the value is `true` or `false` in which case it is cast to a boolean.

```js
import parseQueryString from 's-router/querystring';

const query = '?foo=true&bar=123';

assert.deepEqual(parseQueryString(query), {
	foo: true,
	bar: '123'
});
```

The following nonstandard features are *not* supported:

- nested objects within query strings
- nested arrays within query strings
- arrays set using index values (for instance `?foo[0]=bar&foo[1]=baz`)


### Browser support

The router relies on the [history API](https://developer.mozilla.org/en-US/docs/Web/API/History) which is supported in Internet Explorer versions 10 and above.

The code for the router is written in es6. A transpiled version is available in `s-router/bundle`. For developers using a transpiler anyway (or writing code for es6-ready browsers only), you need only import from `s-router`.