import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const plugins = [
  nodeResolve({
    preferBuiltins: true,
  }),
  commonjs(),
];

const outputs = [
  {
    exports: 'named',
    file: 'dist/index.cjs',
    format: 'cjs',
    sourcemap: true,
  },
  {
    file: 'dist/index.mjs',
    format: 'esm',
    sourcemap: true,
  },
];

export default {
  input: 'rollup.entry.mjs',
  output: outputs,
  plugins,
};
