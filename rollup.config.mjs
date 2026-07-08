import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default [
  // CommonJS (Node.js / legacy require)
  {
    input: 'index.js',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
      exports: 'named',
    },
    plugins: [resolve(), commonjs()],
  },

  // ES Module (modern bundlers / native ESM)
  {
    input: 'index.js',
    output: {
      file: 'dist/index.mjs',
      format: 'esm',
    },
    plugins: [resolve(), commonjs()],
  },

  // UMD (CDN / <script> tag)
  {
    input: 'index.js',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'WesturesCore',
      exports: 'named',
    },
    plugins: [resolve(), commonjs()],
  },
];
