import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
	entry: 'index.js',
	dest: 'bundle.js',
	moduleName: 's-route',
	format: 'umd',
	plugins: [
		nodeResolve({ browser: true }),
		commonjs(),
		buble()
	]
};