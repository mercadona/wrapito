const assert = require('node:assert')

// wrapito registers test hooks at module top level; stub the test runner
// globals so the package can be loaded outside vitest.
globalThis.beforeEach = () => {}
globalThis.afterEach = () => {}

console.log('Testing Node with CJS imports...')

const { wrap, configure, getConfig, matchers, assertions } = require('wrapito')

assert.strictEqual(typeof wrap, 'function', '`wrap` did not import correctly')
assert.strictEqual(typeof configure, 'function', '`configure` did not import correctly')
assert.strictEqual(typeof getConfig, 'function', '`getConfig` did not import correctly')
assert.strictEqual(typeof matchers, 'object', '`matchers` did not import correctly')
assert.strictEqual(typeof assertions, 'object', '`assertions` did not import correctly')

console.log('CJS consumer OK')
