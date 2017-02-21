function parseQueryString(string) {


	if (!string) {
		return {};
	}

	if (string[0] === '?') {
		string = string.slice(1);
	}

	const result = {};
	const entries = string.split('&');

	for (let i = 0; i < entries.length; i++) {
		const split = entries[i].split('=');
		result[decodeURIComponent(split[0])] = decodeURIComponent(split[1]);
	}

	return result;

}

export default parseQueryString;