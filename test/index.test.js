import { expect } from 'chai';
import {
	splitRoute,
	generateRouteTable,
	indexOfOrLength,
	cleanseRoute,
	isMatch,
	matchRoute,
	getParams
} from '../index.js';

describe('index', function() {

	describe('splitRoute', function() {

		it('works', function() {
			expect(splitRoute('/test/foo')).to.deep.equal(['test', 'foo']);
		});

		it('works with trailing slash', function() {
			expect(splitRoute('/test/foo/')).to.deep.equal(['test', 'foo']);
		});

		it('works without leading slash', function() {
			expect(splitRoute('test/foo')).to.deep.equal(['test', 'foo']);
		});

		it('returns empty array for root route', function() {
			expect(splitRoute('/')).to.deep.equal([]);
		});

		it('returns ["*"] for catch-all route', function() {
			expect(splitRoute('*')).to.deep.equal(['*']);
		});

	});

	describe('generateRouteTable', function() {

		it('works', function() {
			const fn = (x) => x;
			expect(generateRouteTable({
				'/': fn,
				'/foo': fn,
				'/foo/:bar': fn,
				'/foo/:bar/baz': fn,
				'*': fn
			})).to.deep.equal({
				'/': [],
				'/foo': ['foo'],
				'/foo/:bar': ['foo', ':bar'],
				'/foo/:bar/baz': ['foo', ':bar', 'baz'],
				'*': ['*']
			});
		});

		it('throws if missing catch-all', function() {
			const fn = (x) => x;
			expect(function() {
				generateRouteTable({
					'/': fn,
					'/foo': fn
				});
			}).to['throw']();
		});

	});

	describe('indexOfOrLength', function() {

		it('returns index of substring', function() {
			expect(indexOfOrLength('foo#bar', '#')).to.equal(3);
		});

		it('returns length if substring not found', function() {
			expect(indexOfOrLength('foo#bar', '?')).to.equal(7);
		});

	});

	describe('cleanseRoute', function() {

		it('works', function() {
			expect(cleanseRoute('/test/foo#bar')).to.equal('/test/foo');
			expect(cleanseRoute('/test/foo?bar=baz')).to.equal('/test/foo');
		});

	});

	describe('isMatch', function() {

		it('returns true if schema segments work with url segments', function() {
			expect(isMatch([], [])).to.equal(true);
			expect(isMatch(['foo'], ['foo'])).to.equal(true);
			expect(isMatch([':foo'], ['bar'])).to.equal(true);
			expect(isMatch(['foo', 'bar'], ['foo', 'bar'])).to.equal(true);
			expect(isMatch(['foo', ':bar'], ['foo', '12'])).to.equal(true);
		});

		it('returns false if schema segments do not match url segments', function() {
			expect(isMatch([], ['foo'])).to.equal(false);
			expect(isMatch([':foo'], ['foo', 'bar'])).to.equal(false);
			expect(isMatch(['foo', ':bar', 'baz'], ['foo', 'bar'])).to.equal(false);
			expect(isMatch(['foo', ':bar', 'baz'], ['foo', 'bar', 'test'])).to.equal(false);
			expect(isMatch(['foo', ':bar', 'baz'], ['foo', 'bar', 'baz', 'test'])).to.equal(false);
		});

	});

	describe('matchRoute', function() {

		const fn = (x) => x;
		const routeTable = generateRouteTable({
			'/': fn,
			'/foo': fn,
			'/foo/:bar': fn,
			'/foo/:bar/baz': fn,
			'*': fn
		});

		it('returns path corresponding to given url', function() {
			expect(matchRoute('/', routeTable)).to.equal('/');
			expect(matchRoute('/foo', routeTable)).to.equal('/foo');
			expect(matchRoute('/foo/bar', routeTable)).to.equal('/foo/:bar');
			expect(matchRoute('/foo/test', routeTable)).to.equal('/foo/:bar');
			expect(matchRoute('/foo/12/baz', routeTable)).to.equal('/foo/:bar/baz');
		});

		it('works with hash in url', function() {
			expect(matchRoute('/foo/12/baz#/test', routeTable)).to.equal('/foo/:bar/baz');
			expect(matchRoute('/foo/12/baz/#/test/', routeTable)).to.equal('/foo/:bar/baz');
		});

		it('works with querystring in url', function() {
			expect(matchRoute('/foo/12/baz?/test=/foo', routeTable)).to.equal('/foo/:bar/baz');
			expect(matchRoute('/foo/12/baz/?test=/foo', routeTable)).to.equal('/foo/:bar/baz');
		});

		it('works with querystring and hash in url', function() {
			expect(matchRoute('/foo/12/baz?/test=/foo#test/', routeTable)).to.equal('/foo/:bar/baz');
			expect(matchRoute('/foo/12/baz/?test=/foo#/test/', routeTable)).to.equal('/foo/:bar/baz');
		});

		it('returns catch-all if no url matches route', function() {
			expect(matchRoute('/test', routeTable)).to.equal('*');
			expect(matchRoute('/foo/bar/baz/test', routeTable)).to.equal('*');
		});

	});

	describe('getParams', function() {

		it('works', function() {
			expect(getParams(['foo', ':bar'], ['foo', '12'])).to.deep.equal({ bar: '12' });
			expect(
				getParams(
					['foo', ':bar', ':baz'],
					['foo', '12', 'test']
				)
			).to.deep.equal({ bar: '12', 'baz': 'test' });
		});

	});

});