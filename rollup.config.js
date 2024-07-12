import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';

const dev = process.env.ROLLUP_WATCH;

const serveOpts = {
	contentBase: ['./dist'],
	host: '0.0.0.0',
	port: '5000',
	allowCrossOrigin: true,
	headers: {
		'Access-Control-Allow-Origin': '*',
	},
};

const plugins = [
	typescript({
		declaration: false,
	}),
	nodeResolve(),
	json(),
	commonjs(),
	babel({
		exclude: 'node_modules/**',
		babelHelpers: 'bundled',
	}),
	...(dev ? [serve(serveOpts)] : [terser()]),
];

export default {
	input: './src/myjdownloader-card.ts',
	output: {
		file: './dist/myjdownloader-card.js',
		format: 'esm',
		name: 'MyJDownloaderCard',
	},
	plugins: [...plugins],
	moduleContext: (id) => {
		const thisAsWindowForModules = [
		'node_modules/@formatjs/intl-utils/lib/src/diff.js',
		'node_modules/@formatjs/intl-utils/lib/src/resolve-locale.js',
		];
		if (thisAsWindowForModules.some((id_) => id.trimEnd().endsWith(id_))) {
		return 'window';
		}
	},
};
