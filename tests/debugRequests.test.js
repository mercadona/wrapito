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
      const request2 = new Request('my-host/request1/path', {
        method: 'POST',
        body: JSON.stringify({ id: 15 }),
      })
      await fetch(request2)
    }
    fetchData()
  }, [])

  return <div>Ciao!</div>
}

it('should warn about the request not being used', async () => {
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

it('should not warn about the request being used', async () => {
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

  wrap(DummyComponent)
    .withNetwork({
      path: '/request1/path',
      host: 'my-host',
      method: 'post',
      requestBody: { id: 15 },
    })
    .debugRequests()
    .mount()

  await wait(() => {
    expect(consoleWarn).not.toHaveBeenCalledWith(
      expect.stringContaining('my-host/request1/path'),
    )
    expect(consoleWarn).not.toHaveBeenCalledWith(
      expect.stringContaining('POST'),
    )
    expect(consoleWarn).not.toHaveBeenCalledWith(
      expect.stringContaining('body: 15'),
    )
  })
})
