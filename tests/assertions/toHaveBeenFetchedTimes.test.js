import { assertions } from '../../src'

expect.extend(assertions)

describe('toHaveBeenFetchedTimes', () => {
  it('should count how many times an url is called', async () => {
    const path = '//some-domain.com/some/path/'
    const expectedPath = '/some/path/'

    await fetch(new Request(path))
    await fetch(new Request(path))

    expect(expectedPath).toHaveBeenFetchedTimes(2)
  })

  it('should check that the path has not been called', async () => {
    const path = '//some-domain.com/some/path/'
    const expectedPath = '/some/path/'

    await fetch(new Request(path))
    const { message } = await assertions.toHaveBeenFetchedTimes(expectedPath, 2)

    expect(message()).toBe("🌯 Burrito: /some/path/ is called 1 times, you expected 2 times")
  })
})
