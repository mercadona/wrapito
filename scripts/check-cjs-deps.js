/**
 * Guards the CJS half of the dual ESM/CJS build.
 *
 * tsup externalises dependencies, so `dist/index.cjs` ships bare `require()`
 * calls that only resolve at consumer runtime. When a dependency publishes an
 * ESM-only major, that bundle breaks for every CommonJS consumer:
 *
 *   - Node < 22.12: `require()` throws ERR_REQUIRE_ESM.
 *   - Node >= 22.12: `require()` returns a module namespace, so esbuild's
 *     interop helper leaves `chalk.white` undefined and the first property
 *     access throws a TypeError.
 *
 * Type-level checks cannot see this: these deps never reach our public type
 * surface. chalk@5 was the first one to bite us.
 *
 * Run after `npm run build`.
 */
import { builtinModules, createRequire } from 'node:module'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, parse, relative, resolve } from 'node:path'

const DIST = resolve('dist')
const BARE_REQUIRE = /require\(\s*["']([^"']+)["']\s*\)/g

const isBuiltin = specifier =>
  specifier.startsWith('node:') || builtinModules.includes(specifier)

const isRelative = specifier =>
  specifier.startsWith('.') || specifier.startsWith('/')

const externalSpecifiersIn = source => {
  const specifiers = new Set()

  for (const [, specifier] of source.matchAll(BARE_REQUIRE)) {
    if (isRelative(specifier) || isBuiltin(specifier)) continue
    specifiers.add(specifier)
  }

  return specifiers
}

/* Nearest package.json wins, exactly as Node decides a .js file's format. */
const packageTypeFor = filePath => {
  const { root } = parse(filePath)
  let directory = dirname(filePath)

  while (true) {
    const manifest = join(directory, 'package.json')

    if (existsSync(manifest)) {
      try {
        return JSON.parse(readFileSync(manifest, 'utf8')).type ?? 'commonjs'
      } catch {
        return 'commonjs'
      }
    }

    if (directory === root) return 'commonjs'
    directory = dirname(directory)
  }
}

const isEsm = filePath => {
  if (filePath.endsWith('.mjs')) return true
  /* .cjs, .node and .json are never ESM. */
  if (!filePath.endsWith('.js')) return false

  return packageTypeFor(filePath) === 'module'
}

const bundles = existsSync(DIST)
  ? readdirSync(DIST)
      .filter(file => file.endsWith('.cjs'))
      .map(file => join(DIST, file))
  : []

if (!bundles.length) {
  console.error('✖ No CJS bundle found in dist. Run `npm run build` first.')
  process.exit(1)
}

const problems = []
let checked = 0

for (const bundle of bundles) {
  const requireFromBundle = createRequire(bundle)

  for (const specifier of externalSpecifiersIn(readFileSync(bundle, 'utf8'))) {
    checked++

    let resolved
    try {
      resolved = requireFromBundle.resolve(specifier)
    } catch (error) {
      problems.push({
        specifier,
        bundle,
        reason: `is not resolvable under the \`require\` condition (${error.code ?? error.message})`,
      })
      continue
    }

    if (isEsm(resolved)) {
      problems.push({
        specifier,
        bundle,
        reason: `resolves to an ES module (${relative(process.cwd(), resolved)})`,
      })
    }
  }
}

/*
 * A pass has to mean something. Zero matches means tsup stopped externalising
 * deps or changed its output shape, not that the bundle is safe.
 */
if (!checked) {
  console.error('✖ Found no external require() calls in the CJS bundle.')
  console.error(
    '  Either tsup stopped externalising dependencies or its output shape',
  )
  console.error(
    '  changed and BARE_REQUIRE no longer matches. Refusing to report a pass.',
  )
  process.exit(1)
}

if (problems.length) {
  console.error(
    `✖ The CJS bundle require()s ${problems.length} module(s) that CommonJS consumers cannot load:\n`,
  )

  for (const { specifier, bundle, reason } of problems) {
    console.error(`  ${specifier} ${reason}`)
    console.error(`    required by ${relative(process.cwd(), bundle)}`)
  }

  console.error(
    '\n  Pin the dependency to its last CJS-capable major, or stop importing it',
  )
  console.error('  from code that ends up in the CJS bundle.')
  process.exit(1)
}

console.log(
  `✔ All ${checked} externalised dependencies in the CJS bundle resolve to CommonJS.`,
)
