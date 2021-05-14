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
      const request = new Request('/non/used/request/path')
      await fetch(request)
    }
    fetchData()
  }, [])

  return <div>Ciao!</div>
}

it('should warn about the not used requests', async () => {
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

  wrap(DummyComponent)
    .withNetwork({
      path: '/request1/path',
      host: 'my-host',
      responseBody: '15',
    })
    .debugRequests()
    .mount()

  await wait(() => {
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('The following request are not being handled:'),
    )
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('/non/used/request/path'),
    )
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('GET'))
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('body:'))
  })
})
