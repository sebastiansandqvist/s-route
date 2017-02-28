import { Router, setPath } from '../../../index.js';

function createLabeledParagraph(label, text) {
	const p = document.createElement('p');
	const strong = document.createElement('strong');
	const span = document.createElement('span');
	strong.textContent = label;
	span.textContent = text;
	p.appendChild(strong);
	p.appendChild(span);
	return p;
}

function createListElement(routeData) {
	const li = document.createElement('li');
	for (const prop in routeData) {
		if (routeData.hasOwnProperty(prop)) {
			li.appendChild(createLabeledParagraph(prop, routeData[prop]));
		}
	}
	return li;
}

document.addEventListener('DOMContentLoaded', function() {

	const ol = document.getElementById('log');

	function log({ path, route, params, hash, search }) {
		console.log({ path, route, params, hash, search });
		ol.appendChild(createListElement({
			path,
			route,
			hash,
			search,
			params: JSON.stringify(params)
		}));
	}
	
	Router({
		'/': log,
		'/foo': log,
		'/foo/:bar': log,
		'/foo/:bar/baz': log,
		'/foo/:bar/:baz/qux': log,
		'*': log
	});

	const buttonList = document.querySelectorAll('input[type=button]');
	buttonList.forEach(function(button) {
		button.onclick = function(event) {
			setPath(event.target.value);
		};
	});

});