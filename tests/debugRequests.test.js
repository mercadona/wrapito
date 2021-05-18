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
      const response = await fetch(
        new Request('my-host/request1', {
          method: 'POST',
          body: JSON.stringify({ id: 1 }),
        }),
      )
      const data = await response.json()
      setName(data.name)

      await fetch(
        new Request('my-host/request2', {
          method: 'POST',
          body: JSON.stringify({ id: 2 }),
        }),
      )
    }
    fetchData()
  }, [])

  return <div>Hi {name}!</div>
}

it('should warn about the code making a request that has not being mocked', async () => {
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

  wrap(GreetingComponent)
    .withNetwork({
      path: '/request1',
      host: 'my-host',
      method: 'post',
      requestBody: { id: 1 },
      responseBody: { name: 'Joe' },
    })
    .debugRequests()
    .mount()

  await screen.findByText('Hi Joe!')

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
    expect.stringContaining('REQUEST BODY: {"id":2}'),
  )
})

it('should not warn if the debugRequests feature is not used', async () => {
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

  wrap(GreetingComponent)
    .withNetwork({
      path: '/request1',
      host: 'my-host',
      method: 'post',
      requestBody: { id: 1 },
      responseBody: { name: 'Joe' },
    })
    .mount()

  await screen.findByText('Hi Joe!')

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

  await screen.findByText('Hi Joe!')

  expect(consoleWarn).not.toHaveBeenCalledWith(
    expect.stringContaining('cannot find any mock matching:'),
  )
})
