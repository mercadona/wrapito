import { configure } from '../../src'
import { matchers } from '../../src/matchers'
import { createMswNetworkMocker } from '../../src/network/mockNetwork'
import { describe, expect, it } from 'vitest'

const mocker = createMswNetworkMocker()
const mockNetwork = (responses: any[] = []) => mocker(responses)

describe('toHaveBeenFetchedTimes', () => {
  it('should count how many times an url is called', async () => {
    const path = 'http://some-domain.com/some/path/'
    const expectedPath = '/some/path/'

    mockNetwork([
      {
        path: '/some/path/',
        host: 'http://some-domain.com',
        responseBody: {},
      },
    ])
    await fetch(new Request(path))
    await fetch(new Request(path))

    expect(expectedPath).toHaveBeenFetchedTimes(2)
  })

  it('should match the whole url', async () => {
    const path = 'http://some-domain.com/some/path/'
    const similarPath = 'http://some-domain.com/some/path/with/something/else/'
    const expectedPath = '/some/path/'

    mockNetwork([
      {
        path: '/some/path/',
        host: 'http://some-domain.com',
        responseBody: {},
      },
      {
        path: '/some/path/with/something/else/',
        host: 'http://some-domain.com',
        responseBody: {},
      },
    ])
    await fetch(new Request(path))
    await fetch(new Request(similarPath))

    expect(expectedPath).toHaveBeenFetchedTimes(1)
  })

  it('should match the url without query params', async () => {
    const path = 'http://some-domain.com/some/path/?foo=bar'
    const expectedPath = '/some/path/'

    mockNetwork([
      {
        path: '/some/path/',
        host: 'http://some-domain.com',
        responseBody: {},
      },
    ])
    await fetch(new Request(path))

    expect(expectedPath).toHaveBeenFetchedTimes(1)
  })

  it('should match the url with query params', async () => {
    const path = 'http://some-domain.com/some/path/?foo=bar'
    const expectedPath = '/some/path/?foo=bar'

    mockNetwork([
      {
        path: '/some/path/?foo=bar',
        host: 'http://some-domain.com',
        responseBody: {},
      },
    ])
    await fetch(new Request(path))

    expect(expectedPath).toHaveBeenFetchedTimes(1)
  })

  it('should match the url when the default host is defined for wrapito', async () => {
    const DEFAULT_HOST = 'https://some-domain.com/api'
    configure({ defaultHost: DEFAULT_HOST })
    const options = { host: 'https://some-domain.com/api' }

    const path = `${DEFAULT_HOST}/some/path/`
    const expectedPath = '/some/path/'

    mockNetwork([
      {
        path: '/some/path/',
        host: DEFAULT_HOST,
        responseBody: {},
      },
    ])
    await fetch(new Request(path))

    expect(expectedPath).toHaveBeenFetchedTimes(1, options)
    configure({ defaultHost: '' })
  })

  it('should match the url when the default host is defined for wrapito and in the expected path', async () => {
    const DEFAULT_HOST = 'https://some-domain.com'
    configure({ defaultHost: DEFAULT_HOST })
    const options = { host: 'https://some-domain.com' }

    const path = `${DEFAULT_HOST}/api/some/path/`
    const expectedPath = '/api/some/path/'

    mockNetwork([
      {
        path: '/api/some/path/',
        host: DEFAULT_HOST,
        responseBody: {},
      },
    ])
    await fetch(new Request(path))

    expect(expectedPath).toHaveBeenFetchedTimes(1, options)
    configure({ defaultHost: '' })
  })

  it('should check that the path has not been called', async () => {
    const path = 'http://some-domain.com/some/path/'
    const expectedPath = '/some/path/'

    mockNetwork([
      {
        path: '/some/path/',
        host: 'http://some-domain.com',
        responseBody: {},
      },
    ])
    await fetch(new Request(path))
    const { message } = matchers.toHaveBeenFetchedTimes(expectedPath, 2)

    expect(message()).toBe(
      '🌯 Wrapito: /some/path/ is called 1 times, you expected 2 times',
    )
  })
})
