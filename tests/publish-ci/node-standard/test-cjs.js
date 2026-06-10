const assert = require('node:assert')

// wrapito registers test hooks on load; stub them to run outside a test runner
globalThis.beforeEach = () => {}
globalThis.afterEach = () => {}

console.log('Testing Node with CJS imports...')

const wrapito = require('wrapito')

assert.strictEqual(typeof wrapito.wrap, 'function', '`wrap` did not import correctly')

console.log('CJS consumer OK')
