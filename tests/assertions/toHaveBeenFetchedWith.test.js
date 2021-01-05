import { assertions } from '../../src'

expect.extend(assertions)

describe('toHaveBeenFetchedWith', () => {
  it('should check that the path has been called', async () => {
    const path = '/some/path/'
    const expectedPath = '/some/path/'
    await fetch(path)

    const { message } = assertions.toHaveBeenFetchedWith(expectedPath)

    expect(message()).toBeUndefined()
    expect(expectedPath).toHaveBeenFetchedWith()
  })

  it('should check that the path has not been called', async () => {
    const path = '/some/path'
    const expectedPath = '/some/unknown'

    await fetch(path)
    const { message } = assertions.toHaveBeenFetchedWith(expectedPath)

    expect(message()).toBe("/some/unknown ain't got called")
    expect(expectedPath).not.toHaveBeenFetchedWith()
  })

  describe('request body', () => {
    it('should check that the path has been called with the supplied body', async () => {
      const path = '/some/path/'
      await fetch(path, { body: { name: 'some name' } })

      const { message } = assertions.toHaveBeenFetchedWith(path, {
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

    it('should allow to specify the body elements in different order', async () => {
      const path = '/some/path/'
      await fetch(path, { body: { name: 'name', surname: 'surname' } })

      const { message } = assertions.toHaveBeenFetchedWith(path, {
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
      const path = '/some/path/'
      const expectedBody = { name: 'some name' }
      const receivedBody = { surname: 'some surname' }

      await fetch(path, { body: receivedBody })
      const { message } = assertions.toHaveBeenFetchedWith(path, {
        body: expectedBody,
      })

      expect(message()).toBe(
        `Fetch body does not match, expected ${JSON.stringify(
          expectedBody,
        )} received ${JSON.stringify(receivedBody)}`,
      )
      expect(path).not.toHaveBeenFetchedWith({
        body: expectedBody,
      })
    })

    it('should allow to leave the body option empty', async () => {
      const path = '/some/path/'
      await fetch(path, { body: { surname: 'some surname' } })

      const { message } = assertions.toHaveBeenFetchedWith(path)

      expect(message()).toBeUndefined()
      expect(path).toHaveBeenFetchedWith()
    })
  })

  describe('request method', () => {
    it('should check that the path has been called with the supplied method', async () => {
      const path = '/some/path/'
      await fetch(path, { method: 'POST' })

      const { message } = assertions.toHaveBeenFetchedWith(path, {
        method: 'POST',
      })

      expect(message()).toBeUndefined()
      expect(path).toHaveBeenFetchedWith({
        method: 'POST',
      })
    })

    it('should differentiate between to request to the same path with different methods', async () => {
      const path = '/some/path/'
      await fetch(path, { method: 'POST' })
      await fetch(path, { method: 'PUT' })

      const { message } = assertions.toHaveBeenFetchedWith(path, {
        method: 'PUT',
      })

      expect(message()).toBeUndefined()
      expect(path).toHaveBeenFetchedWith({
        method: 'PUT',
      })
    })

    it('should check that the path has not been called with the supplied method', async () => {
      const path = '/some/path/'
      await fetch(path, { method: 'PUT' })

      const { message } = assertions.toHaveBeenFetchedWith(path, {
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
      const path = '/some/path/'
      await fetch(path, { method: 'POST' })

      const { message } = assertions.toHaveBeenFetchedWith(path)

      expect(message()).toBeUndefined()
      expect(path).toHaveBeenFetchedWith()
    })
  })
})
