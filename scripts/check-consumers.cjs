// Consumer fixture check: packs the package with `npm pack`, installs the
// tarball into a throwaway project, and loads it the way real consumers do
// (require + import). This validates the exports map, the published files
// and the resolvability of runtime dependencies — things attw and publint
// cannot see because they never install node_modules.
//
// The CJS consumer runs with --no-experimental-require-module to simulate
// Node versions without require(ESM) support (<20.19, 22.0-22.11), where an
// externalized ESM-only dependency (e.g. chalk@5) throws ERR_REQUIRE_ESM.
const { execFileSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const root = path.resolve(__dirname, '..')
const expectedExports = ['wrap', 'configure', 'getConfig', 'matchers', 'assertions']

// dist/index.cjs|mjs register test hooks at module top level; stub the test
// runner globals so the package can be loaded outside vitest.
const stubs = 'globalThis.beforeEach = () => {}; globalThis.afterEach = () => {};'
const assertion = `
  const missing = ${JSON.stringify(expectedExports)}.filter(name => !(name in wrapito))
  if (missing.length > 0) {
    console.error('missing exports: ' + missing.join(', '))
    process.exit(1)
  }
`

const consumers = [
  {
    file: 'consumer.cjs',
    nodeArgs: ['--no-experimental-require-module'],
    source: `${stubs}
      const wrapito = require('wrapito')
      ${assertion}
      console.log('CJS consumer OK (' + ${JSON.stringify(expectedExports.join(', '))} + ')')`,
  },
  {
    file: 'consumer.mjs',
    nodeArgs: [],
    source: `${stubs}
      const wrapito = await import('wrapito')
      ${assertion}
      console.log('ESM consumer OK (' + ${JSON.stringify(expectedExports.join(', '))} + ')')`,
  },
]

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'wrapito-consumer-'))
try {
  const packOutput = execFileSync(
    'npm',
    ['pack', '--silent', '--pack-destination', fixture],
    { cwd: root, encoding: 'utf8' },
  )
  const tarball = path.join(fixture, packOutput.trim().split('\n').pop())

  fs.writeFileSync(
    path.join(fixture, 'package.json'),
    JSON.stringify({ name: 'wrapito-consumer-fixture', private: true }),
  )
  execFileSync('npm', ['install', '--silent', '--no-audit', '--no-fund', tarball], {
    cwd: fixture,
  })

  for (const consumer of consumers) {
    fs.writeFileSync(path.join(fixture, consumer.file), consumer.source)
    execFileSync(process.execPath, [...consumer.nodeArgs, consumer.file], {
      cwd: fixture,
      stdio: 'inherit',
    })
  }
} finally {
  fs.rmSync(fixture, { recursive: true, force: true })
}
