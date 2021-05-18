import React, { useEffect, useState } from 'react'
import { render, cleanup, screen } from '@testing-library/react'
import { wrap, configure, highlightNotUtilizedResponses } from '../src/index'
import { MyComponentMakingHttpCalls } from './components.mock'

configure({ defaultHost: 'my-host', mount: render })

afterEach(() => {
  cleanup()
  console.warn.mockRestore()
})

const GreetingComponent = () => {
  const [name, setName] = useState('')

  useEffect(() => {
    async function fetchData() {
      await fetch(
        new Request('my-host/request1', {
          method: 'POST',
          body: JSON.stringify({ id: 1 }),
        }),
      )

      const response = await fetch(
        new Request('my-host/request2', {
          method: 'POST',
          body: JSON.stringify({ id: 2 }),
        }),
      )
      const data = await response.json()
      setName(data?.name)
    }
    fetchData()
  }, [])

  return <div>Hi {name}!</div>
}

it('should warn about the code making a request that has not being mocked', async () => {
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

  wrap(GreetingComponent)
    .withNetwork({
      path: '/request2',
      host: 'my-host',
      method: 'post',
      requestBody: { id: 2 },
      responseBody: { name: 'Sam' },
    })
    .debugRequests()
    .mount()

  await screen.findByText('Hi Sam!')

  expect(consoleWarn).toHaveBeenCalledWith(
    expect.stringContaining('cannot find any mock matching:'),
  )
  expect(consoleWarn).toHaveBeenCalledWith(
    expect.stringContaining('URL: my-host/request1'),
  )
  expect(consoleWarn).toHaveBeenCalledWith(
    expect.stringContaining('METHOD: post'),
  )
  expect(consoleWarn).toHaveBeenCalledWith(
    expect.stringContaining('REQUEST BODY: {"id":1}'),
  )
})

describe('when no using withNetwork builder', () => {
  it('should warn about all the request being done by the production code', async () => {
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

    wrap(GreetingComponent).debugRequests().mount()

    await screen.findByText('Hi !')

    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('cannot find any mock matching:'),
    )
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('URL: my-host/request1'),
    )
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('METHOD: post'),
    )
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('REQUEST BODY: {"id":1}'),
    )
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('URL: my-host/request2'),
    )
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('METHOD: post'),
    )
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('REQUEST BODY: {"id":2}'),
    )
  })
})

it('should not warn if the debugRequests feature is not used', async () => {
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

  wrap(GreetingComponent)
    .withNetwork({
      path: '/request2',
      host: 'my-host',
      method: 'post',
      requestBody: { id: 2 },
      responseBody: { name: 'Sam' },
    })
    .mount()

  await screen.findByText('Hi Sam!')

  expect(consoleWarn).not.toHaveBeenCalledWith(
    expect.stringContaining('cannot find any mock matching:'),
  )
})

it('should not warn if all the requests are being mocked', async () => {
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

  wrap(GreetingComponent)
    .withNetwork([
      {
        path: '/request1',
        host: 'my-host',
        method: 'post',
        requestBody: { id: 1 },
        responseBody: { name: 'Joe' },
      },
      {
        path: '/request2',
        host: 'my-host',
        method: 'post',
        requestBody: { id: 2 },
        responseBody: { name: 'Sam' },
      },
    ])
    .debugRequests()
    .mount()

  await screen.findByText('Hi Sam!')

  expect(consoleWarn).not.toHaveBeenCalledWith(
    expect.stringContaining('cannot find any mock matching:'),
  )
})
