import { globalFetchAssertions } from '../src'

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

  expect(message()).toBe('/some/unknown ain\'t got called')
  expect(path).not.toHaveBeenFetched()
})
