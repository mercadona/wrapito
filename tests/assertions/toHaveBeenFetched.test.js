import { assertions, configure } from '../../src'

expect.extend(assertions)

describe('toHaveBeenFetched', () => {
  it('should check that the path has been called', async () => {
    const path = '//some-domain.com/some/path/'
    const expectedPath = '/some/path/'

    await fetch(new Request(path))
    const { message } = await assertions.toHaveBeenFetched(expectedPath)

    expect(message()).toBe('🌯 Wrapito: /some/path/ is called')
    expect(expectedPath).toHaveBeenFetched()
  })

  it('should check that the path has not been called', async () => {
    const path = '//some-domain.com/some/path/'
    const expectedPath = '/some/unknown'

    await fetch(new Request(path))
    const { message } = await assertions.toHaveBeenFetched(expectedPath)

    expect(message()).toBe("🌯 Wrapito: /some/unknown ain't got called")
    expect(expectedPath).not.toHaveBeenFetched()
  })

  it('should check that the path has been called without new Request', async () => {
    const path = '//some-domain.com/some/path/'
    const expectedPath = '/some/path/'

    await fetch(path)
    const { message } = await assertions.toHaveBeenFetched(expectedPath)

    expect(message()).toBe('🌯 Wrapito: /some/path/ is called')
    expect(expectedPath).toHaveBeenFetched()
  })

  it('should check that the path has been called with custom host', async () => {
    const path = '//some-domain.com/some/path/'
    const expectedPath = '/some/path/'
    configure({
      defaultHost: 'https://some-domain.com',
    })
    const options = { host: 'https://some-domain.com' }
    await fetch(new Request(path))
    const { message } = await assertions.toHaveBeenFetched(
      expectedPath,
      options,
    )

    expect(message()).toBe('🌯 Wrapito: /some/path/ is called')
    expect(expectedPath).toHaveBeenFetched(options)
    configure({ defaultHost: '' })
  })
})
