import { globalFetchAssertions } from '../../src'

expect.extend(globalFetchAssertions)

it('should check that the path has been called', async () => {
  const path = '/some/path/'
  const expectedPath = '/some/path/'
  await fetch(path)

  const { message } = globalFetchAssertions.toHaveBeenFetched(expectedPath)

  expect(message()).toBeUndefined()
  expect(expectedPath).toHaveBeenFetched()
})

it('should check that the path has not been called', async () => {
  const path = '/some/unknown'

  await fetch('/some/path')
  const { message } = globalFetchAssertions.toHaveBeenFetched(path)

  expect(message()).toBe("/some/unknown ain't got called")
  expect(path).not.toHaveBeenFetched()
})

describe('toHaveBeenFetchedWith', () => {
  it('should check that the path has not been called', async () => {
    const path = '/some/unknown'

    await fetch('/some/path')
    const { message } = globalFetchAssertions.toHaveBeenFetchedWith(path)

    expect(message()).toBe("/some/unknown ain't got called")
    expect(path).not.toHaveBeenFetched()
  })

  describe('request body', () => {
    it('should check that the path has been called with the supplied body', async () => {
      const path = '/some/path/'
      const expectedPath = '/some/path/'
      await fetch(path, { body: { name: 'some name' } })

      const { message } = globalFetchAssertions.toHaveBeenFetchedWith(
        expectedPath,
        {
          body: {
            name: 'some name',
          },
        },
      )

      expect(message()).toBeUndefined()
      expect(expectedPath).toHaveBeenFetchedWith({
        body: {
          name: 'some name',
        },
      })
    })

    it('should check allow to specify the body elements in different order', async () => {
      const path = '/some/path/'
      const expectedPath = '/some/path/'
      await fetch(path, { body: { name: 'name', surname: 'surname' } })

      const { message } = globalFetchAssertions.toHaveBeenFetchedWith(
        expectedPath,
        {
          body: {
            surname: 'surname',
            name: 'name',
          },
        },
      )

      expect(message()).toBeUndefined()
      expect(expectedPath).toHaveBeenFetchedWith({
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
      const { message } = globalFetchAssertions.toHaveBeenFetchedWith(path, {
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

    it('should allow to leave the body option empty empty', async () => {
      const path = '/some/path/'
      await fetch(path, { body: { surname: 'some surname' } })

      const { message } = globalFetchAssertions.toHaveBeenFetchedWith(
        path,
      )

      expect(message()).toBeUndefined()
      expect(path).toHaveBeenFetchedWith()
    })
  })

  describe('request method', () => {
    it('should check that the path has been called with the supplied method', async () => {
      const path = '/some/path/'
      const expectedPath = '/some/path/'
      await fetch(path, { method: 'POST' })

      const { message } = globalFetchAssertions.toHaveBeenFetchedWith(
        expectedPath,
        {
          method: 'POST',
        },
      )

      expect(message()).toBeUndefined()
      expect(expectedPath).toHaveBeenFetchedWith({
        method: 'POST',
      })
    })

    it('should check that the path has not been called with the supplied method', async () => {
      const path = '/some/path/'
      const expectedPath = '/some/path/'
      await fetch(path, { method: 'PUT' })

      const { message } = globalFetchAssertions.toHaveBeenFetchedWith(
        expectedPath,
        {
          method: 'POST',
        },
      )

      expect(message()).toBe(
        'fetch method does not match, expected POST received PUT',
      )
      expect(expectedPath).not.toHaveBeenFetchedWith({
        method: 'POST',
      })
    })

    it('should allow to leave the method empty', async () => {
      const path = '/some/path/'
      const expectedPath = '/some/path/'
      await fetch(path, { method: 'POST' })

      const { message } = globalFetchAssertions.toHaveBeenFetchedWith(
        expectedPath,
      )

      expect(message()).toBeUndefined()
      expect(expectedPath).toHaveBeenFetchedWith()
    })
  })
})
