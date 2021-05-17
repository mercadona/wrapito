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
      await fetch(new Request('my-host/request1'))

      await fetch(
        new Request('my-host/request2', {
          method: 'POST',
          body: JSON.stringify({ id: 15 }),
        }),
      )
    }
    fetchData()
  }, [])

  return <div>Ciao!</div>
}

it('should warn about the code making a request that has not being mocked', async () => {
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

  wrap(DummyComponent)
    .withNetwork({
      path: '/request1',
      host: 'my-host',
    })
    .debugRequests()
    .mount()

  await wait(() => {
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('cannot find any mock matching:'),
    )
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('URL: my-host/request2'),
    )
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('METHOD: post'),
    )
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('REQUEST BODY: {"id":15}'),
    )
  })
})

it('should not warn if the debugRequests feature is not used', async () => {
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

  wrap(DummyComponent)
    .withNetwork({
      path: '/request1',
      host: 'my-host',
    })
    .mount()

  await wait(() => {
    expect(consoleWarn).not.toHaveBeenCalledWith(
      expect.stringContaining('cannot find any mock matching:'),
    )
  })
})

it('should not warn if all the requests are being mocked', async () => {
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

  wrap(DummyComponent)
    .withNetwork([
      {
        path: '/request1',
        host: 'my-host',
        method: 'get',
      },
      {
        path: '/request2',
        host: 'my-host',
        method: 'post',
        requestBody: { id: 15 },
      },
    ])
    .debugRequests()
    .mount()

  await wait(() => {
    expect(consoleWarn).not.toHaveBeenCalledWith(
      expect.stringContaining('cannot find any mock matching:'),
    )
  })
})
