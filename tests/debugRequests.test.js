import React, { useEffect, useState } from 'react'
import { render, cleanup, screen, fireEvent } from '@testing-library/react'
import { wrap, configure } from '../src/index'
import { MyComponentWithFeedback } from './components.mock'

configure({ defaultHost: 'my-host', mount: render })

afterEach(() => {
  cleanup()
  process.env.npm_config_debugRequests = undefined
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

it('should warn about the code making a request that has not being mocked enough times', async () => {
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()
  configure({ mount: render })
  wrap(MyComponentWithFeedback)
    .withNetwork({
      host: 'my-host',
      path: '/path/to/save/',
      method: 'post',
      multipleResponses: [{ responseBody: { name: 'Sam' } }],
    })
    .debugRequests()
    .mount()

  fireEvent.click(screen.getByText('save'))
  await screen.findByText('Sam')

  fireEvent.click(screen.getByText('save'))
  const multipleResponsesString = JSON.stringify([{ name: 'Sam' }])

  expect(consoleWarn).toHaveBeenCalledWith(
    expect.stringContaining(
      'Missing response in multiple responses for path /path/to/save/ and method post',
    ),
  )
  // expect(consoleWarn).toHaveBeenCalledWith(
  //   expect.stringContaining(`responses: ${multipleResponsesString}`),
  // )
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

it('should warn about not fetched requests when --debugRequests param is used', async () => {
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()
  process.env.npm_config_debugRequests = 'true'

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
