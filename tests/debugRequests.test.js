import React, { useEffect } from 'react'
import { render, wait, cleanup } from '@testing-library/react'
import { wrap, configure, highlightNotUtilizedResponses } from '../src/index'
import { MyComponentMakingHttpCalls } from './components.mock'

configure({ defaultHost: 'my-host', mount: render })

afterEach(() => {
  cleanup()
  console.warn.mockRestore()
})

const mockedUrl = 'my-host/mocked'
const notMockedUrl = 'my-host/not-mocked'

const DummyComponent = () => {
  useEffect(() => {
    async function fetchData() {
      const nonMockedRequest = new Request(notMockedUrl)
      await fetch(nonMockedRequest)
      const mockedRequest = new Request(mockedUrl, {
        method: 'POST',
        body: JSON.stringify({ id: 15 }),
      })
      const mockedResponse = await fetch(mockedRequest)
      mockedResponse.json()
    }
    fetchData()
  }, [])

  return <div>Ciao!</div>
}

it('should warn about the code making a request that has not being mocked', async () => {
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

  wrap(DummyComponent)
    .withNetwork({
      path: '/mocked',
      host: 'my-host',
      method: 'post',
      requestBody: { id: 15 },
      responseBody: '15',
    })
    .debugRequests()
    .mount()

  await wait(() => {
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('cannot find any mock matching:'),
    )
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('URL: my-host/not-mocked'),
    )
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('METHOD: get'),
    )
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('REQUEST BODY: undefined'),
    )
  })
})

it('should not warn if the debugRequests feature is not used', async () => {
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

  wrap(DummyComponent)
    .withNetwork({
      path: '/mocked',
      host: 'my-host',
      method: 'post',
      requestBody: { id: 15 },
      responseBody: '15',
    })
    .mount()

  await wait(() => {
    expect(consoleWarn).not.toHaveBeenCalledWith(
      expect.stringContaining('cannot find any mock matching:'),
    )
  })
})

it('should not warn about the code making a request that has being mocked', async () => {
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

  wrap(DummyComponent)
    .withNetwork([
      {
        path: '/mocked',
        host: 'my-host',
        method: 'post',
        requestBody: { id: 15 },
      },
      {
        path: '/not-mocked',
        host: 'my-host',
        method: 'get',
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
