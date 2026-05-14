import type { Extension, Wrap, WrapExtensionAPI } from '../../src/models'

type AssertTrue<T extends true> = T

type _AssertVoidExtension = AssertTrue<
  (<T>(api: WrapExtensionAPI, args: T) => void) extends Extension ? true : false
>

type _AssertWrapExtension = AssertTrue<
  (<T>(api: WrapExtensionAPI, args: T) => Wrap) extends Extension ? true : false
>
