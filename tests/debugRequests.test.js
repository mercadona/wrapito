import { render, wait, cleanup } from '@testing-library/react'
import { wrap, configure, highlightNotUtilizedResponses } from '../src/index'
import { MyComponentMakingHttpCalls } from './components.mock'

configure({ defaultHost: 'my-host', mount: render })

afterEach(() => {
  cleanup()
  console.warn.mockRestore()
})

it('should warn all the used requests', async () => {
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

  wrap(MyComponentMakingHttpCalls)
    .debugRequests()
    .mount()

  await wait(() => {
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('your code is doing this requests'),
    )
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('my-host/path/to/get/quantity/'),
    )
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('get'))
  })
})
