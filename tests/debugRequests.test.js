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
      await fetch(mockedRequest)
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
      responseBody: '15',
    })
    .debugRequests()
    .mount()

  await wait(() => {
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('The following request is not being handled:'),
    )
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining(`url: ${notMockedUrl}`),
    )
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('method: GET'))
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('body:'))
  })
})

it('should not warn about the code making a request that has being mocked', async () => {
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

  wrap(DummyComponent)
    .withNetwork({
      path: '/mocked',
      host: 'my-host',
      method: 'post',
      requestBody: { id: 15 },
    })
    .debugRequests()
    .mount()

  await wait(() => {
    expect(consoleWarn).not.toHaveBeenCalledWith(
      expect.stringContaining(`url: ${mockedUrl}`),
    )
    expect(consoleWarn).not.toHaveBeenCalledWith(
      expect.stringContaining('method: POST'),
    )
    expect(consoleWarn).not.toHaveBeenCalledWith(
      expect.stringContaining('body: 15'),
    )
  })
})
