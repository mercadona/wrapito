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

  it('should match the whole url', async () => {
    const path = '//some-domain.com/some/path/'
    const similarPath = '//some-domain.com/some/path/with/something/else/'
    const expectedPath = '/some/path/'

    await fetch(new Request(path))
    await fetch(new Request(similarPath))

    expect(expectedPath).toHaveBeenFetchedTimes(1)
  })

  it('should match the url without query params', async () => {
    const path = '//some-domain.com/some/path/?foo=bar'
    const expectedPath = '/some/path/'

    await fetch(new Request(path))

    expect(expectedPath).toHaveBeenFetchedTimes(1)
  })

  it('should match the url with query params', async () => {
    const path = '//some-domain.com/some/path/?foo=bar'
    const expectedPath = '/some/path/?foo=bar'

    await fetch(new Request(path))

    expect(expectedPath).toHaveBeenFetchedTimes(1)
  })

  it('should check that the path has not been called', async () => {
    const path = '//some-domain.com/some/path/'
    const expectedPath = '/some/path/'

    await fetch(new Request(path))
    const { message } = await assertions.toHaveBeenFetchedTimes(expectedPath, 2)

    expect(message()).toBe(
      '🌯 Wrapito: /some/path/ is called 1 times, you expected 2 times',
    )
  })
})
