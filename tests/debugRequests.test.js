import React, { useEffect } from 'react'
import { render, wait, cleanup } from '@testing-library/react'
import { wrap, configure, highlightNotUtilizedResponses } from '../src/index'
import { MyComponentMakingHttpCalls } from './components.mock'

configure({ defaultHost: 'my-host', mount: render })

afterEach(() => {
  cleanup()
  console.warn.mockRestore()
})

const DummyComponent = () => {
  useEffect(() => {
    async function fetchData() {
      const request = new Request('path/to/request1')
      await fetch(request)
    }
    fetchData()
  }, [])

  return <div>Ciao!</div>
}

it('should warn all the used requests', async () => {
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

  wrap(DummyComponent).debugRequests().mount()

  await wait(() => {
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('your code is doing this requests'),
    )
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('path/to/request1'),
    )
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('GET'))
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining("body:"),
    )
  })
})
