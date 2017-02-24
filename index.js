/*
 * turns '/foo/:bar/baz' into ['foo', ':bar', 'baz']
 */
export function splitRoute(string) {
	return string.split('/').filter((x) => Boolean(x));
}


/*
 * given input like this:
 * 	{ '/': fn, '/foo': fn, '/foo/:bar': fn, '*': fn }
 * returns output like this:
 * 	{ '/': [], '/foo': ['foo'], '/foo/:bar': ['foo', ':bar'], '*': ['*'] }
 */
export function generateRouteTable(routeMap) {

	if (routeMap['*'] === undefined) {
		throw new Error('s-router requires catch-all * route');
	}

	const table = {};

	for (const route in routeMap) {
		if (routeMap.hasOwnProperty(route)) {
			table[route] = splitRoute(route);
		}
	}

	return table;

}


/*
 * used to simplify cleanseRoute
 */
export function indexOfOrLength(string, substr) {
	const index = string.indexOf(substr);
	return index > -1 ? index : string.length;
}


/*
 * turns /foo/bar#baz into /foo/bar
 * turns /foo?bar=baz into /foo
 */
export function cleanseRoute(string) {
	const index = Math.min(indexOfOrLength(string, '#'), indexOfOrLength(string, '?'));
	return string.slice(0, index);
}


/*
 * `routeSegments` comes from schema, eg: ['foo', ':bar', ':baz']
 * `urlSegments` comes from address bar, eg: ['foo', '12', 'test']
 * returns true if routeSegments are compatible with urlSegments
 */
export function isMatch(routeSegments, urlSegments) {

	if (routeSegments.length !== urlSegments.length) {
		return false;
	}

	let matched = true;
	for (let i = 0; i < routeSegments.length; i++) {
		if (routeSegments[i] === urlSegments[i]) { continue; }
		if (routeSegments[i][0] === ':') { continue; }
		matched = false;
	}

	return matched;

}

/*
 * locates route in table that matches current url from address bar. eg:
 *
 * matchRoute(
 * 	'/foo/12',
 * 	{ '/foo/:bar': ['foo', ':bar'], '*': ['*'] }
 * ) === '/foo/:bar'
 */
export function matchRoute(url, routeTable) {
	const segments = splitRoute(cleanseRoute(url));
	for (const route in routeTable) {
		if (isMatch(routeTable[route], segments)) {
			return route;
		}
	}
	return '*';
}

/*
 * `routeSegments` comes from schema, eg: ['foo', ':bar', ':baz']
 * `urlSegments` comes from address bar, eg: ['foo', '12', 'test']
 * returns url params object, eg: { bar: '12', baz: 'test' }
 *
 * NOTE: assumes routeSegments is a match for given url
 */
export function getParams(routeSegments, urlSegments) {
	const params = {};
	for (let i = 0; i < routeSegments.length; i++) {
		if (routeSegments[i][0] === ':') {
			params[routeSegments[i].slice(1)] = urlSegments[i];
		}
	}
	return params;
}

