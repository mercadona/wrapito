import * as matchers from '../matchers'

// @ts-ignore
const globalExpect = global.expect // eslint-ignore

if (globalExpect !== undefined) {
  globalExpect.extend(matchers)
} else {
  throw new Error(
    "Unable to find Jest's or Vitest global expect. " +
      'Please check you have added jest-extended correctly to your jest configuration. ' +
      'See https://github.com/jest-community/jest-extended#setup for help.',
  )
}
