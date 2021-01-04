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
})
