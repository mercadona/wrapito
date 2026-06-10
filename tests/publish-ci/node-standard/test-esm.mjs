import assert from 'node:assert'
import { createRequire } from 'node:module'

// wrapito registers test hooks at module top level; stub the test runner
// globals so the package can be loaded outside vitest.
globalThis.beforeEach = () => {}
globalThis.afterEach = () => {}

console.log('Testing Node with ESM imports...')

const esm = await import('wrapito')

assert.strictEqual(typeof esm.wrap, 'function', '`wrap` did not import correctly')

// Dual-package parity: whatever the ESM build exports, the CJS build must
// export too (and vice versa), so new exports never need to be listed here.
const cjs = createRequire(import.meta.url)('wrapito')
const publicKeys = mod => Object.keys(mod).filter(key => key !== 'default').sort()

assert.deepStrictEqual(
  publicKeys(cjs),
  publicKeys(esm),
  'CJS and ESM builds export different things',
)

console.log(`ESM consumer OK (exports: ${publicKeys(esm).join(', ')})`)
