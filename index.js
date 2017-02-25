// NOTE: relies on history API (IE >= 10)


/*
 * turns '/foo/:bar/baz' into ['foo', ':bar', 'baz']
 */
export function splitRoute(string) {
	return string.split('/').filter((x) => Boolean(x));
}


/*
 * given user defined routes, eg:
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
	const segments = splitRoute(cleanseRoute(url)); // is cleanseRoute not needed because location.pathname strips hash and search?
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
 * NOTE: Assumes routeSegments is a match for given url
 * NOTE: Works for catch-all because routeSegments[0][0] will never === ':',
 * 				then loop ends. Critical to loop over routeSegments.length and not
 * 				urlSegments.length for this reason.
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

/*
 * Router takes routeMap, eg:
 * 	{ '/': fn, '/foo': fn, '/foo/:bar': fn, '*': fn }
 *
 * Matches current route from address bar immediately, and
 * sets up resolveRoute function to be used onpopstate and
 * when `setPath` is called.
 */
export default function Router(routeMap, $window = window) {

	const routeTable = generateRouteTable(routeMap);

	Router.resolveRoute = function() {

		const currentPath = $window.location.pathname;
		const currentHash = $window.location.hash;
		const currentSearch = $window.location.search;

		const match = matchRoute(currentPath, routeTable);
		routeMap[match]({
			path: currentPath,
			hash: currentHash,
			search: currentSearch,
			route: match,
			params: getParams(routeTable[match], splitRoute(currentPath))
		});

	};

	$window.onpopstate = Router.resolveRoute;
	Router.resolveRoute();

}

/*
 * sets route in address bar and calls router to match the new route
 *
 * `path` to set can include hash and search
 */
export function setPath(path, options = {}, $window = window) {

	const state = options ? options.state : null;
	const title = options ? options.title : '';

	if (options.replaceState) { $window.history.replaceState(state, title, path); }
	else { $window.history.pushState(state, title, path); }

	// for rare case when used before/without an initialized Router
	if (typeof Router.resolveRoute === 'function') {
		Router.resolveRoute();
	}

}

