const fs = require('fs')
const packageJson = fs.readFileSync('package.json').toString()
fs.writeFileSync('dist/package.json', packageJson)

const readme = fs.readFileSync('README.md').toString()
fs.writeFileSync('dist/README.md', readme)
