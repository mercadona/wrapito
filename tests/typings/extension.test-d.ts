import { expectTypeOf, test } from 'vitest'
import type { Extension, Wrap, WrapExtensionAPI } from '../../src/models'

test('Extension accepts void-returning callbacks', () => {
  expectTypeOf<
    <T>(api: WrapExtensionAPI, args: T) => void
  >().toMatchTypeOf<Extension>()
})

test('Extension accepts Wrap-returning callbacks', () => {
  expectTypeOf<
    <T>(api: WrapExtensionAPI, args: T) => Wrap
  >().toMatchTypeOf<Extension>()
})
