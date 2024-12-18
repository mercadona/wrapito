interface MockResultReturn<T> {
  type: 'return'
  /**
   * The value that was returned from the function. If function returned a Promise, then this will be a resolved value.
   */
  value: T
}
interface MockResultIncomplete {
  type: 'incomplete'
  value: undefined
}
interface MockResultThrow {
  type: 'throw'
  /**
   * An error that was thrown during function execution.
   */
  value: any
}
type MockResult<T> =
  | MockResultReturn<T>
  | MockResultThrow
  | MockResultIncomplete
interface MockContext<TArgs, TReturns> {
  /**
   * This is an array containing all arguments for each call. One item of the array is the arguments of that call.
   *
   * @example
   * const fn = vi.fn()
   *
   * fn('arg1', 'arg2')
   * fn('arg3')
   *
   * fn.mock.calls === [
   *   ['arg1', 'arg2'], // first call
   *   ['arg3'], // second call
   * ]
   */
  calls: TArgs[]
  /**
   * This is an array containing all instances that were instantiated when mock was called with a `new` keyword. Note that this is an actual context (`this`) of the function, not a return value.
   */
  instances: TReturns[]
  /**
   * The order of mock's execution. This returns an array of numbers which are shared between all defined mocks.
   *
   * @example
   * const fn1 = vi.fn()
   * const fn2 = vi.fn()
   *
   * fn1()
   * fn2()
   * fn1()
   *
   * fn1.mock.invocationCallOrder === [1, 3]
   * fn2.mock.invocationCallOrder === [2]
   */
  invocationCallOrder: number[]
  /**
   * This is an array containing all values that were `returned` from the function.
   *
   * The `value` property contains the returned value or thrown error. If the function returned a promise, the `value` will be the _resolved_ value, not the actual `Promise`, unless it was never resolved.
   *
   * @example
   * const fn = vi.fn()
   *   .mockReturnValueOnce('result')
   *   .mockImplementationOnce(() => { throw new Error('thrown error') })
   *
   * const result = fn()
   *
   * try {
   *   fn()
   * }
   * catch {}
   *
   * fn.mock.results === [
   *   {
   *     type: 'return',
   *     value: 'result',
   *   },
   *   {
   *     type: 'throw',
   *     value: Error,
   *   },
   * ]
   */
  results: MockResult<TReturns>[]
  /**
   * This contains the arguments of the last call. If spy wasn't called, will return `undefined`.
   */
  lastCall: TArgs | undefined
}

export interface MockInstance<TArgs extends any[] = any[], TReturns = any> {
  /**
   * Use it to return the name given to mock with method `.mockName(name)`.
   */
  getMockName: () => string
  /**
   * Sets internal mock name. Useful to see the name of the mock if an assertion fails.
   */
  mockName: (n: string) => this
  /**
   * Current context of the mock. It stores information about all invocation calls, instances, and results.
   */
  mock: MockContext<TArgs, TReturns>
  /**
   * Clears all information about every call. After calling it, all properties on `.mock` will return an empty state. This method does not reset implementations.
   *
   * It is useful if you need to clean up mock between different assertions.
   */
  mockClear: () => this
  /**
   * Does what `mockClear` does and makes inner implementation an empty function (returning `undefined` when invoked). This also resets all "once" implementations.
   *
   * This is useful when you want to completely reset a mock to the default state.
   */
  mockReset: () => this
  /**
   * Does what `mockReset` does and restores inner implementation to the original function.
   *
   * Note that restoring mock from `vi.fn()` will set implementation to an empty function that returns `undefined`. Restoring a `vi.fn(impl)` will restore implementation to `impl`.
   */
  mockRestore: () => void
  /**
   * Returns current mock implementation if there is one.
   *
   * If mock was created with `vi.fn`, it will consider passed down method as a mock implementation.
   *
   * If mock was created with `vi.spyOn`, it will return `undefined` unless a custom implementation was provided.
   */
  getMockImplementation: () => ((...args: TArgs) => TReturns) | undefined
  /**
   * Accepts a function that will be used as an implementation of the mock.
   * @example
   * const increment = vi.fn().mockImplementation(count => count + 1);
   * expect(increment(3)).toBe(4);
   */
  mockImplementation: (fn: (...args: TArgs) => TReturns) => this
  /**
   * Accepts a function that will be used as a mock implementation during the next call. Can be chained so that multiple function calls produce different results.
   * @example
   * const fn = vi.fn(count => count).mockImplementationOnce(count => count + 1);
   * expect(fn(3)).toBe(4);
   * expect(fn(3)).toBe(3);
   */
  mockImplementationOnce: (fn: (...args: TArgs) => TReturns) => this
  /**
   * Overrides the original mock implementation temporarily while the callback is being executed.
   * @example
   * const myMockFn = vi.fn(() => 'original')
   *
   * myMockFn.withImplementation(() => 'temp', () => {
   *   myMockFn() // 'temp'
   * })
   *
   * myMockFn() // 'original'
   */
  withImplementation: <T>(
    fn: (...args: TArgs) => TReturns,
    cb: () => T,
  ) => T extends Promise<unknown> ? Promise<this> : this
  /**
   * Use this if you need to return `this` context from the method without invoking actual implementation.
   */
  mockReturnThis: () => this
  /**
   * Accepts a value that will be returned whenever the mock function is called.
   */
  mockReturnValue: (obj: TReturns) => this
  /**
   * Accepts a value that will be returned during the next function call. If chained, every consecutive call will return the specified value.
   *
   * When there are no more `mockReturnValueOnce` values to use, mock will fallback to the previously defined implementation if there is one.
   * @example
   * const myMockFn = vi
   *   .fn()
   *   .mockReturnValue('default')
   *   .mockReturnValueOnce('first call')
   *   .mockReturnValueOnce('second call')
   *
   * // 'first call', 'second call', 'default'
   * console.log(myMockFn(), myMockFn(), myMockFn())
   */
  mockReturnValueOnce: (obj: TReturns) => this
  /**
   * Accepts a value that will be resolved when async function is called.
   * @example
   * const asyncMock = vi.fn().mockResolvedValue(42)
   * asyncMock() // Promise<42>
   */
  mockResolvedValue: (obj: Awaited<TReturns>) => this
  /**
   * Accepts a value that will be resolved during the next function call. If chained, every consecutive call will resolve specified value.
   * @example
   * const myMockFn = vi
   *   .fn()
   *   .mockResolvedValue('default')
   *   .mockResolvedValueOnce('first call')
   *   .mockResolvedValueOnce('second call')
   *
   * // Promise<'first call'>, Promise<'second call'>, Promise<'default'>
   * console.log(myMockFn(), myMockFn(), myMockFn())
   */
  mockResolvedValueOnce: (obj: Awaited<TReturns>) => this
  /**
   * Accepts an error that will be rejected when async function is called.
   * @example
   * const asyncMock = vi.fn().mockRejectedValue(new Error('Async error'))
   * await asyncMock() // throws 'Async error'
   */
  mockRejectedValue: (obj: any) => this
  /**
   * Accepts a value that will be rejected during the next function call. If chained, every consecutive call will reject specified value.
   * @example
   * const asyncMock = vi
   *   .fn()
   *   .mockResolvedValueOnce('first call')
   *   .mockRejectedValueOnce(new Error('Async error'))
   *
   * await asyncMock() // first call
   * await asyncMock() // throws "Async error"
   */
  mockRejectedValueOnce: (obj: any) => this
}

type Fetch = typeof global.window.fetch
export type FetchMockInstance = MockInstance & Fetch
