import path from 'path'

import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import strip from '@rollup/plugin-strip'

const rootDirectory = path.join(__dirname)
const srcDirectory = path.join(rootDirectory, 'src')
const buildDirectory = path.join(rootDirectory, 'build')

const inputFile = path.join(srcDirectory, 'index.ts')

const extensions = ['.js', '.mjs', '.ts']

const external = ['fs']

const plugins = [
  resolve({ extensions, skip: ['fs'] }),
  commonjs(),
  babel({
    extensions,
    babelHelpers: 'bundled',
  }),
]

export default [
  {
    input: inputFile,
    output: [
      {
        file: path.join(buildDirectory, 'cjs.js'),
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: path.join(buildDirectory, 'esm.js'),
        format: 'esm',
        sourcemap: true,
      },
    ],
    external,
    plugins,
  },
  {
    input: inputFile,
    output: [
      {
        file: path.join(rootDirectory, 'extension', 'content', 'hwp.js'),
        format: 'iife',
        name: 'HWP',
      },
    ],
    external,
    plugins: [
      strip({
        include: [
          './node_modules/cfb/cfb.js',
        ],
        functions: ['get_fs', 'fs.*'],
      }),
      ...plugins,
    ],
  }
]
