import { expect } from 'chai';
import querystring from '../querystring.js';

describe('querystring', function() {

	it('works', function() {
		const data = querystring('?foo=bar');
		expect(data).to.deep.equal({ foo: 'bar' });
	});

	it('works without `?`', function() {
		const data = querystring('foo=bar');
		expect(data).to.deep.equal({ foo: 'bar' });
	});

	it('parses empty string', function() {
		const data = querystring('');
		expect(data).to.deep.equal({});
	});

	it('parses empty string `?`', function() {
		const data = querystring('?');
		expect(data).to.deep.equal({});
	});

	it('parses flat object', function() {
		const data = querystring('?a=b&c=d');
		expect(data).to.deep.equal({ a: 'b', c: 'd' });
	});

	it('handles escaped values', function() {
		const data = querystring('?%3B%3A%40%26%3D%2B%24%2C%2F%3F%25%23=%3B%3A%40%26%3D%2B%24%2C%2F%3F%25%23');
		expect(data).to.deep.equal({ ';:@&=+$,/?%#': ';:@&=+$,/?%#' });
	});

	it('handles escaped slashes followed by a number', function() {
		const data = querystring('?hello=%2Fen%2F1');
		expect(data).to.deep.equal({ 'hello': '/en/1' });
	});

	it('puts values of repeated keys into array', function() {
		const data = querystring('a=foo&a=bar');
		expect(data).to.deep.equal({ a: ['foo', 'bar'] });
	});

	it('strips brackets', function() {
		const data = querystring('a[]=foo&a[]=bar');
		expect(data).to.deep.equal({ a: ['foo', 'bar'] });
	});

	it('strips escaped brackets', function() {
		const data = querystring('a%5B%5D=foo&a%5B%5D=bar');
		expect(data).to.deep.equal({ a: ['foo', 'bar'] });
	});

	it('forces single element array if brackets are present', function() {
		const data = querystring('a[]=foo');
		expect(data).to.deep.equal({ a: ['foo'] });
	});

	it('forces single element array if escaped brackets are present', function() {
		const data = querystring('a%5B%5D=foo');
		expect(data).to.deep.equal({ a: ['foo'] });
	});

});