import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';
import serve from 'rollup-plugin-serve';
import json from '@rollup/plugin-json';
import ignore from './rollup-plugins/ignore';

const dev = process.env.ROLLUP_WATCH;

const serveOpts = {
  contentBase: ['./dist'],
  host: '0.0.0.0',
  port: 5000,
  allowCrossOrigin: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
};

const plugins = [
  nodeResolve({}),
  commonjs(),
  typescript(),
  json(),
  babel({
    exclude: 'node_modules/**',
  }),
  dev && serve(serveOpts),
  !dev && terser(),
  ignore({
    files: [].map((file) => require.resolve(file)),
  }),
];

export default [
  {
    input: './src/myjdownloader-card.ts',
    output: {
      dir: './dist/',
      format: 'es',
    },
    plugins: [...plugins],
  },
];