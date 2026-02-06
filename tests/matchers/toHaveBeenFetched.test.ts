import { configure } from '../../src'
import { matchers } from '../../src/matchers'
import { createMswNetworkMocker } from '../../src/network/mockNetwork'
import { describe, expect, it } from 'vitest'

const mocker = createMswNetworkMocker()
const mockNetwork = (responses: any[] = []) => mocker(responses)

describe('toHaveBeenFetched', () => {
  it('should check that the path has been called', async () => {
    const path = 'http://some-domain.com/some/path/'
    const expectedPath = '/some/path/'

    mockNetwork([
      {
        path: '/some/path/',
        host: 'some-domain.com',
        responseBody: { ok: true },
      },
    ])

    await fetch(new Request(path))
    const { message } = matchers.toHaveBeenFetched(expectedPath)

    expect(message()).toBe('🌯 Wrapito: /some/path/ is called')
    expect(expectedPath).toHaveBeenFetched()
  })

  it('should check that the path has not been called', async () => {
    const path = 'http://some-domain.com/some/path/'
    const expectedPath = '/some/unknown'

    mockNetwork()
    await fetch(new Request(path))
    const { message } = matchers.toHaveBeenFetched(expectedPath)

    expect(message()).toBe('🌯 Wrapito: /some/unknown ain\'t got called')
    expect(expectedPath).not.toHaveBeenFetched()
  })

  it('should check that the path has been called without new Request', async () => {
    const path = 'http://some-domain.com/some/path/'
    const expectedPath = '/some/path/'

    mockNetwork([
      {
        path: '/some/path/',
        host: 'some-domain.com',
        responseBody: {},
      },
    ])
    await fetch(path)
    const { message } = matchers.toHaveBeenFetched(expectedPath)

    expect(message()).toBe('🌯 Wrapito: /some/path/ is called')
    expect(expectedPath).toHaveBeenFetched()
  })

  it('should check that the path has been called with custom host', async () => {
    const path = 'http://other-domain.com/some/path/'
    const expectedPath = '/some/path/'
    const host = 'https://other-domain.com'
    configure({
      defaultHost: 'https://some-domain.com',
    })
    mockNetwork([
      {
        path: '/some/path/',
        host: 'other-domain.com',
        responseBody: {},
      },
    ])
    await fetch(new Request(path))
    const { message } = matchers.toHaveBeenFetched(expectedPath, {
      host,
    })

    expect(message()).toBe(
      '🌯 Wrapito: https://other-domain.com/some/path/ is called',
    )
    expect(expectedPath).toHaveBeenFetched({ host })
    configure({ defaultHost: '' })
  })

  it('should check that the path has been called with custom host without protocol', async () => {
    const path = 'http://other-domain.com/some/path/'
    const expectedPath = '/some/path/'
    const host = 'https://other-domain.com'
    configure({
      defaultHost: '/some-domain.com',
    })
    mockNetwork([
      {
        path: '/some/path/',
        host: 'other-domain.com',
        responseBody: {},
      },
    ])
    await fetch(new Request(path))
    const { message } = matchers.toHaveBeenFetched(expectedPath, {
      host,
    })

    expect(message()).toBe(
      '🌯 Wrapito: https://other-domain.com/some/path/ is called',
    )
    expect(expectedPath).toHaveBeenFetched({ host })
    configure({ defaultHost: '' })
  })

  it('should check that the path has not been called with custom host', async () => {
    const path = 'http://some-domain.com/some/path/'
    const expectedPath = '/some/path/'
    const host = 'https://other-domain.com'
    configure({
      defaultHost: 'https://some-domain.com',
    })
    mockNetwork([
      {
        path: '/some/path/',
        host: 'some-domain.com',
        responseBody: {},
      },
    ])
    await fetch(new Request(path))
    const { message } = matchers.toHaveBeenFetched(expectedPath, {
      host,
    })

    expect(message()).toBe(
      `🌯 Wrapito: ${host}${expectedPath} ain't got called`,
    )
    expect(expectedPath).not.toHaveBeenFetched({
      host,
    })
    configure({ defaultHost: '' })
  })

  it('should work with msw network mocker without mocking fetch', async () => {
    configure({ defaultHost: 'http://api.test' })
    mockNetwork([
      {
        path: '/some/path/',
        host: 'api.test',
        responseBody: { ok: true },
      },
    ])

    await fetch('http://api.test/some/path/')

    expect('/some/path/').toHaveBeenFetched()
    configure({ defaultHost: '' })
  })
})
