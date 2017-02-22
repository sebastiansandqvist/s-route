// function Router({ routes, defaultRoute = '/', prefix = '/' }) {
// }

function log(x) {
	console.log(x);
}

function generateRouteTable(routes) {

	const table = {};

	for (const route in routes) {
		const segments = route.split('/').slice(1);
	}

	return table;

}

const routes = {
	'/': log,
	'/home': log,
	'/home/foo': log,
	'/messages/:id': log,
	'/messages/:id/:foo': log
};

const routeTable = generateRouteTable(routes);
console.log(routeTable);

function matchRoute(path) {

}