import type { RequestOptions } from './src/models'

interface CustomMatchers<R = unknown> {
  toHaveBeenFetched(options?: RequestOptions): R
  toHaveBeenFetchedWith(options?: RequestOptions): R
  toHaveBeenFetchedTimes(expectedLength?: number, options?: RequestOptions): R
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

declare module 'wrapito' {
  const matchers: CustomMatchers<any>
  export = matchers
}
