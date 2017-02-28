(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global['s-route'] = global['s-route'] || {})));
}(this, (function (exports) { 'use strict';

// NOTE: relies on history API (IE >= 10)


/*
 * turns '/foo/:bar/baz' into ['foo', ':bar', 'baz']
 */
function splitRoute(string) {
	return string.split('/').filter(function (x) { return Boolean(x); });
}


/*
 * given user defined routes, eg:
 * 	{ '/': fn, '/foo': fn, '/foo/:bar': fn, '*': fn }
 * returns output like this:
 * 	{ '/': [], '/foo': ['foo'], '/foo/:bar': ['foo', ':bar'], '*': ['*'] }
 */
function generateRouteTable(routeMap) {

	if (routeMap['*'] === undefined) {
		throw new Error('s-router requires catch-all * route');
	}

	var table = {};

	for (var route in routeMap) {
		if (routeMap.hasOwnProperty(route)) {
			table[route] = splitRoute(route);
		}
	}

	return table;

}


/*
 * used to simplify cleanseRoute
 */
function indexOfOrLength(string, substr) {
	var index = string.indexOf(substr);
	return index > -1 ? index : string.length;
}


/*
 * turns /foo/bar#baz into /foo/bar
 * turns /foo?bar=baz into /foo
 */
function cleanseRoute(string) {
	var index = Math.min(indexOfOrLength(string, '#'), indexOfOrLength(string, '?'));
	return string.slice(0, index);
}


/*
 * `routeSegments` comes from schema, eg: ['foo', ':bar', ':baz']
 * `urlSegments` comes from address bar, eg: ['foo', '12', 'test']
 * returns true if routeSegments are compatible with urlSegments
 */
function isMatch(routeSegments, urlSegments) {

	if (routeSegments.length !== urlSegments.length) {
		return false;
	}

	var matched = true;
	for (var i = 0; i < routeSegments.length; i++) {
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
function matchRoute(url, routeTable) {
	var segments = splitRoute(cleanseRoute(url)); // is cleanseRoute not needed because location.pathname strips hash and search?
	for (var route in routeTable) {
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
function getParams(routeSegments, urlSegments) {
	var params = {};
	for (var i = 0; i < routeSegments.length; i++) {
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
function Router(routeMap, $window) {
	if ( $window === void 0 ) $window = window;


	var routeTable = generateRouteTable(routeMap);

	Router.resolveRoute = function() {

		var currentPath = $window.location.pathname;
		var currentHash = $window.location.hash;
		var currentSearch = $window.location.search;

		var match = matchRoute(currentPath, routeTable);
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
function setPath(path, options, $window) {
	if ( options === void 0 ) options = {};
	if ( $window === void 0 ) $window = window;


	var state = options ? options.state : null;
	var title = options ? options.title : '';

	if (options.replaceState) { $window.history.replaceState(state, title, path); }
	else { $window.history.pushState(state, title, path); }

	// for rare case when used before/without an initialized Router
	if (typeof Router.resolveRoute === 'function') {
		Router.resolveRoute();
	}

}

exports.splitRoute = splitRoute;
exports.generateRouteTable = generateRouteTable;
exports.indexOfOrLength = indexOfOrLength;
exports.cleanseRoute = cleanseRoute;
exports.isMatch = isMatch;
exports.matchRoute = matchRoute;
exports.getParams = getParams;
exports.Router = Router;
exports.setPath = setPath;

Object.defineProperty(exports, '__esModule', { value: true });

})));
