import { assertions } from '../../src'

expect.extend(assertions)

describe('toHaveBeenFetchedWith', () => {
  it('should check that the path has been called', async () => {
    const path = '//some-domain.com/some/path/'
    const expectedPath = '/some/path/'

    await fetch(new Request(path))
    const { message } = await assertions.toHaveBeenFetchedWith(expectedPath)

    expect(message()).toBeUndefined()
    expect(expectedPath).toHaveBeenFetchedWith()
  })

  it('should check that the path has not been called', async () => {
    const path = '//some-domain.com/some/path/'
    const expectedPath = '/some/unknown'

    await fetch(new Request(path))
    const { message } = await assertions.toHaveBeenFetchedWith(expectedPath)

    expect(message()).toBe("/some/unknown ain't got called")
    expect(expectedPath).not.toHaveBeenFetchedWith()
  })

  describe('request body', () => {
    it('should check that the path has been called with the supplied body', async () => {
      const path = '//some-domain.com/some/path/'
      const request = new Request(path, {
        method: 'POST',
        body: JSON.stringify({ name: 'some name' }),
      })
      await fetch(request)

      const { message } = await assertions.toHaveBeenFetchedWith(path, {
        body: {
          name: 'some name',
        },
      })

      expect(message()).toBeUndefined()
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

      const { message } = await assertions.toHaveBeenFetchedWith(path, {
        body: {
          age: 32,
        },
      })

      expect(message()).toBeUndefined()
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

      const { message } = await assertions.toHaveBeenFetchedWith(path, {
        body: {
          surname: 'surname',
          name: 'name',
        },
      })

      expect(message()).toBeUndefined()
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
      const { message } = await assertions.toHaveBeenFetchedWith(path, {
        body: expectedBody,
      })

      expect(message()).toBe(
        `Fetch body does not match, expected ${JSON.stringify(
          expectedBody,
        )} received ${JSON.stringify([receivedBody])}`,
      )
      expect(path).not.toHaveBeenFetchedWith({
        body: expectedBody,
      })
    })

    it('should allow to leave the body option empty', async () => {
      const path = '//some-domain.com/some/path/'
      const request = new Request(path, {
        method: 'POST',
        body: JSON.stringify({ surname: 'some surname' }),
      })
      await fetch(request)

      const { message } = await assertions.toHaveBeenFetchedWith(path)

      expect(message()).toBeUndefined()
      expect(path).toHaveBeenFetchedWith()
    })
  })

  describe('request method', () => {
    it('should check that the path has been called with the supplied method', async () => {
      const path = '//some-domain.com/some/path/'
      const request = new Request(path, { method: 'POST' })
      await fetch(request)

      const { message } = await assertions.toHaveBeenFetchedWith(path, {
        method: 'POST',
      })

      expect(message()).toBeUndefined()
      expect(path).toHaveBeenFetchedWith({
        method: 'POST',
      })
    })

    it('should differentiate between to request to the same path with different methods', async () => {
      const path = '//some-domain.com/some/path/'
      const postRequest = new Request(path, { method: 'POST' })
      const putRequest = new Request(path, { method: 'PUT' })
      await fetch(postRequest)
      await fetch(putRequest)

      const { message } = await assertions.toHaveBeenFetchedWith(path, {
        method: 'PUT',
      })

      expect(message()).toBeUndefined()
      expect(path).toHaveBeenFetchedWith({
        method: 'PUT',
      })
    })

    it('should check that the path has not been called with the supplied method', async () => {
      const path = '//some-domain.com/some/path/'
      const request = new Request(path, { method: 'PUT' })
      await fetch(request)

      const { message } = await assertions.toHaveBeenFetchedWith(path, {
        method: 'POST',
      })

      expect(message()).toBe(
        'Fetch method does not match, expected POST received PUT',
      )
      expect(path).not.toHaveBeenFetchedWith({
        method: 'POST',
      })
    })

    it('should allow to leave the method empty', async () => {
      const path = '//some-domain.com/some/path/'
      const request = new Request(path, { method: 'POST' })
      await fetch(request)

      const { message } = await assertions.toHaveBeenFetchedWith(path)

      expect(message()).toBeUndefined()
      expect(path).toHaveBeenFetchedWith()
    })
  })
})
