import '@testing-library/jest-dom/vitest'
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'
import type { RequestOptions } from './src/models'

interface CustomMatchers<R = unknown> {
  toHaveBeenFetched(options?: RequestOptions): R
  toHaveBeenFetchedWith(options?: RequestOptions): R
  toHaveBeenFetchedTimes(expectedLength?: number, options?: RequestOptions): R
}

declare module 'vitest' {
  interface Assertion<T = any>
    extends CustomMatchers<T>,
      TestingLibraryMatchers<T, void> {}
  interface AsymmetricMatchersContaining
    extends CustomMatchers,
      TestingLibraryMatchers<any, void> {}
}

declare module 'wrapito' {
  const matchers: CustomMatchers<any>
  export = matchers
}
