const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const fixture = path.join(root, 'tests', 'publish-ci', 'node-standard')

const run = (file, args, cwd) =>
  execFileSync(file, args, { cwd, stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8' })

const packOutput = run('npm', ['pack', '--silent', '--pack-destination', fixture], root)
const tarball = path.join(fixture, packOutput.trim().split('\n').pop())

try {
  run('npm', ['install', '--no-save', '--no-package-lock', '--no-audit', '--no-fund', tarball], fixture)
  console.log(run('npm', ['test', '--silent'], fixture))
} finally {
  fs.rmSync(tarball, { force: true })
}
