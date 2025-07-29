import { defineConfig } from 'tsup'

export default defineConfig(options => ({
  entry: {
    index: './src/index.ts',
  },
  outDir: 'dist',
  format: ['cjs', 'esm'],
  tsconfig: './tsconfig.json',
  clean: true,
  dts: true,
  minify: !options?.watch,
  outExtension: ({ format }) => ({
    js: format === 'cjs' ? '.js' : '.mjs',
  }),
}))
