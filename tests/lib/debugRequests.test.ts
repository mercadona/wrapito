import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { configure, wrap } from '../../src/index'
import { GreetingComponent, MyComponentWithFeedback } from '../components.mock'
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

const originalWarn = window.console.warn

beforeAll(() => (window.console.warn = vi.fn()))

afterEach(() => {
  cleanup()
  process.env.npm_config_debugRequests = undefined
})

afterAll(() => {
  window.console.warn = originalWarn
})

configure({ defaultHost: 'my-host', mount: render })

it('should warn about the code making a request that has not being mocked', async () => {
  const consoleWarn = vi.spyOn(console, 'warn')

  wrap(GreetingComponent)
    .withNetwork({
      path: '/request2',
      host: 'my-host',
      method: 'POST',
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
  const consoleWarn = vi.spyOn(console, 'warn')
  configure({ mount: render })
  wrap(MyComponentWithFeedback)
    .withNetwork({
      host: 'my-host',
      path: '/path/to/save/',
      method: 'POST',
      multipleResponses: [{ responseBody: { name: 'Sam' } }],
    })
    .debugRequests()
    .mount()

  fireEvent.click(screen.getByText('save'))
  await screen.findByText('Sam')

  fireEvent.click(screen.getByText('save'))

  expect(consoleWarn).toHaveBeenCalledWith(
    expect.stringContaining(
      '🌯 Wrapito:  Missing response in the multipleResponses array for path /path/to/save/ and method POST.',
    ),
  )
})

describe('when no using withNetwork builder', () => {
  it('should warn about all the request being done by the production code', async () => {
    const consoleWarn = vi.spyOn(console, 'warn')

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
  const consoleWarn = vi.spyOn(console, 'warn')

  wrap(GreetingComponent)
    .withNetwork({
      path: '/request2',
      host: 'my-host',
      method: 'POST',
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
  const consoleWarn = vi.spyOn(console, 'warn')

  wrap(GreetingComponent)
    .withNetwork([
      {
        path: '/request1',
        host: 'my-host',
        method: 'POST',
        requestBody: { id: 1 },
        responseBody: { name: 'Joe' },
      },
      {
        path: '/request2',
        host: 'my-host',
        method: 'POST',
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
  const consoleWarn = vi.spyOn(console, 'warn')
  process.env.npm_config_debugRequests = 'true'

  wrap(GreetingComponent)
    .withNetwork({
      path: '/request2',
      host: 'my-host',
      method: 'POST',
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

it('should warn about not fetched requests when --debugRequests param is used with method in lowerCase', async () => {
  const consoleWarn = vi.spyOn(console, 'warn')
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
