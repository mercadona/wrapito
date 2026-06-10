const assert = require('node:assert')

// wrapito registers test hooks at module top level; stub the test runner
// globals so the package can be loaded outside vitest.
globalThis.beforeEach = () => {}
globalThis.afterEach = () => {}

console.log('Testing Node with CJS imports...')

const wrapito = require('wrapito')

assert.strictEqual(typeof wrapito.wrap, 'function', '`wrap` did not import correctly')

console.log('CJS consumer OK')
