import { expectTypeOf, it } from 'vitest'
import type { Extension, Wrap, WrapExtensionAPI } from '../../src/models'

it('should accept void-returning extension callbacks', () => {
  expectTypeOf<
    <T>(api: WrapExtensionAPI, args: T) => void
  >().toMatchTypeOf<Extension>()
})

it('should accept Wrap-returning extension callbacks', () => {
  expectTypeOf<
    <T>(api: WrapExtensionAPI, args: T) => Wrap
  >().toMatchTypeOf<Extension>()
})
