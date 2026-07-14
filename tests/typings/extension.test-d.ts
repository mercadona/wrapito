import { expectTypeOf, it } from 'vitest'
import type {
  Extension,
  Extensions,
  Wrap,
  WrapExtensionAPI,
} from '../../src/models'

it('should accept void-returning extension callbacks', () => {
  expectTypeOf<
    (api: WrapExtensionAPI, args: unknown[]) => void
  >().toMatchTypeOf<Extension>()
})

it('should accept Wrap-returning extension callbacks', () => {
  expectTypeOf<
    (api: WrapExtensionAPI, args: unknown[]) => Wrap
  >().toMatchTypeOf<Extension>()
})

it('should accept extensions without an args parameter', () => {
  expectTypeOf<(api: WrapExtensionAPI) => void>().toMatchTypeOf<Extension>()
})

it('should give typed args when the consumer fills the Args tuple', () => {
  expectTypeOf<
    (api: WrapExtensionAPI, args: [string[]]) => void
  >().toMatchTypeOf<Extension<[string[]]>>()
})

it('should accept tuple-typed extensions inside the extend map', () => {
  expectTypeOf<{
    withFeatureFlags: (api: WrapExtensionAPI, args: [string[]]) => void
  }>().toMatchTypeOf<Extensions>()
})
