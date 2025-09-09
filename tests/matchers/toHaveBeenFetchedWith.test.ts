import '../../vitest.d.ts'
import { matchers } from '../../src/matchers'
import { describe, it, expect } from 'vitest'
import { diff } from 'jest-diff'

expect.extend(matchers)

describe('toHaveBeenFetchedWith', () => {
  it('should check that the path has been called', async () => {
    const path = '//some-domain.com/some/path/'
    const expectedPath = '/some/path/'
    const body = {
      method: 'POST' as const,
      body: JSON.stringify({ name: 'some name' }),
    }

    await fetch(new Request(path, body))
    matchers.toHaveBeenFetchedWith(expectedPath, body)

    expect(expectedPath).toHaveBeenFetchedWith({ body: { name: 'some name' } })
  })

  it('should check that the path has not been called', async () => {
    const path = '//some-domain.com/some/path/'
    const expectedPath = '/some/unknown'

    await fetch(new Request(path))
    const { message } = matchers.toHaveBeenFetchedWith(expectedPath)

    expect(message()).toBe("🌯 Wrapito: /some/unknown ain't got called")
    expect(expectedPath).not.toHaveBeenFetchedWith()
  })

  describe('request body', () => {
    it('should check that the request has body', async () => {
      const path = '//some-domain.com/some/path/'

      await fetch(new Request(path))
      const { message, pass } = matchers.toHaveBeenFetchedWith(path)

      expect(message()).toBe('🌯 Wrapito: Unable to find body.')
      expect(pass).toBe(false)
    })

    it('should check that the path has been called with the supplied body', async () => {
      const path = '//some-domain.com/some/path/'
      const request = new Request(path, {
        method: 'POST',
        body: JSON.stringify({ name: 'some name' }),
      })
      await fetch(request)

      const { message } = matchers.toHaveBeenFetchedWith(path, {
        body: {
          name: 'some name',
        },
      })

      expect(message()).toBe('Test passing')
      expect(path).toHaveBeenFetchedWith({
        body: {
          name: 'some name',
        },
      })
    })

    it('should not throw already read TypeError', async () => {
      const path = '//some-domain.com/some/path/'
      const request = new Request(path, {
        method: 'POST',
        body: JSON.stringify({ name: 'some name' }),
        //@ts-ignore
        _bodyInit: JSON.stringify({ name: 'some name' }),
      })

      await fetch(request)

      //@ts-ignore
      fetch.mock.calls[0][0].json()

      const { message } = matchers.toHaveBeenFetchedWith(path, {
        body: {
          name: 'some name',
        },
      })

      expect(message()).toBe('Test passing')
      expect(path).toHaveBeenFetchedWith({
        body: {
          name: 'some name',
        },
      })
    })

    it('should differentiate between to request to the same path but with different body', async () => {
      const path = '//some-domain.com/some/path/'
      const firstRequest = new Request(path, {
        method: 'POST',
        body: JSON.stringify({ name: 'some name' }),
      })
      const secondRequest = new Request(path, {
        method: 'POST',
        body: JSON.stringify({ age: 32 }),
      })
      await fetch(firstRequest)
      await fetch(secondRequest)

      expect(path).toHaveBeenFetchedWith({
        body: {
          name: 'some name',
        },
      })
      expect(path).toHaveBeenFetchedWith({
        body: {
          age: 32,
        },
      })
    })

    it('should allow to specify the body elements in different order', async () => {
      const path = '//some-domain.com/some/path/'
      const request = new Request(path, {
        method: 'POST',
        body: JSON.stringify({ name: 'name', surname: 'surname' }),
      })
      await fetch(request)

      const { message } = matchers.toHaveBeenFetchedWith(path, {
        body: {
          surname: 'surname',
          name: 'name',
        },
      })

      expect(message()).toBe('Test passing')
      expect(path).toHaveBeenFetchedWith({
        body: {
          surname: 'surname',
          name: 'name',
        },
      })
    })

    it('should check that the path has not been called with the supplied body', async () => {
      const path = '//some-domain.com/some/path/'
      const expectedBody = { name: 'some name' }
      const receivedBody = { surname: 'some surname' }
      const request = new Request(path, {
        method: 'POST',
        body: JSON.stringify(receivedBody),
      })

      await fetch(request)
      const { message } = matchers.toHaveBeenFetchedWith(path, {
        body: expectedBody,
      })

      expect(message()).toBe(
        `🌯 Wrapito: Fetch body does not match.
${diff(expectedBody, receivedBody)}`,
      )
      expect(path).not.toHaveBeenFetchedWith({
        body: expectedBody,
      })
    })
  })

  describe('request method', () => {
    it('should check that the path has been called with the supplied method', async () => {
      const path = '//some-domain.com/some/path/'
      const body = { method: 'POST' }

      await fetch(new Request(path, body))
      const { message } = matchers.toHaveBeenFetchedWith(path, {
        body: {},
        method: 'POST',
      })

      expect(message()).toBe('Test passing')
      expect(path).toHaveBeenFetchedWith({
        body: {},
        method: 'POST',
      })
    })

    it('should check complex body requests', async () => {
      const path = '//some-domain.com/some/path/'
      const request = new Request(path, {
        method: 'POST',
        body: JSON.stringify({
          two: {
            levels: ['Hello'],
          },
        }),
      })

      await fetch(request)

      expect(path).toHaveBeenFetchedWith({
        body: {
          two: {
            levels: ['Hello'],
          },
        },
      })
    })

    it('should differentiate between to request to the same path with different methods', async () => {
      const path = '//some-domain.com/some/path/'
      const postRequest = new Request(path, { method: 'POST' })
      const putRequest = new Request(path, { method: 'PUT' })
      await fetch(postRequest)
      await fetch(putRequest)

      const { message } = matchers.toHaveBeenFetchedWith(path, {
        body: {},
        method: 'PUT',
      })

      expect(message()).toBe('Test passing')
      expect(path).toHaveBeenFetchedWith({
        body: {},
        method: 'PUT',
      })
    })

    it('should check that the path has not been called with the supplied method', async () => {
      const path = '//some-domain.com/some/path/'
      const request = new Request(path, { method: 'PUT' })
      await fetch(request)

      const { message } = matchers.toHaveBeenFetchedWith(path, {
        method: 'POST',
      })

      expect(message()).toBe(
        '🌯 Wrapito: Fetch method does not match, expected POST received PUT',
      )
      expect(path).not.toHaveBeenFetchedWith({
        method: 'POST',
      })
    })

    it('should allow to leave the method empty', async () => {
      const path = '//some-domain.com/some/path/'
      const request = new Request(path, { method: 'POST' })
      await fetch(request)

      const { message } = matchers.toHaveBeenFetchedWith(path, {
        body: {},
      })

      expect(message()).toBe('Test passing')
      expect(path).toHaveBeenFetchedWith({ body: {} })
    })
  })

  describe('request host', () => {
    it('should check that the path has been called with the supplied host', async () => {
      const path = '//some-domain.com/some/path/'
      const expectedHost = 'some-domain.com'
      const body = {}

      await fetch(new Request(path, body))
      const { message } = matchers.toHaveBeenFetchedWith(path, {
        body: {},
        host: 'some-domain.com',
      })

      expect(message()).toBe('Test passing')
      expect(path).toHaveBeenFetchedWith({
        body: {},
        host: expectedHost,
      })
    })

    it('should check that the path has not been called with the supplied host', async () => {
      const path = '//some-domain.com/some/path/'
      const expectedHost = 'another-domain.com'
      const request = new Request(path)
      await fetch(request)

      const { message } = matchers.toHaveBeenFetchedWith(path, {
        body: {},
        host: 'another-domain.com',
      })

      expect(message()).toBe(
        '🌯 Wrapito: Host request does not match, expected another-domain.com received some-domain.com',
      )
      expect(path).not.toHaveBeenFetchedWith({
        body: {},
        host: expectedHost,
      })
    })
  })
})
