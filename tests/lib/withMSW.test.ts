import { fireEvent, render, screen } from '@testing-library/react'
import { configure, wrap } from '../../src/index'
import { expect, it, vi } from 'vitest'

import {
  MyComponentMakingHttpCallsWithQueryParams,
  MyComponentWithFeedback,
  MyComponentWithNetwork,
  MyComponentWithPost,
} from '../components.mock'

it('should have network by default using MSW', async () => {
  configure({ mount: render })
  wrap(MyComponentWithNetwork).mount()

  expect(await screen.findByText('SUCCESS')).toBeInTheDocument()
})

it('should have network with an array of requests using MSW', async () => {
  vi.spyOn(console, 'warn')
  configure({ mount: render })
  wrap(MyComponentWithNetwork)
    .withNetwork([
      { path: '/path/with/response/', host: 'api.test', responseBody: '15' },
    ])
    .mount()

  expect(await screen.findByText('SUCCESS')).toBeInTheDocument()
  expect(await screen.findByText('15')).toBeInTheDocument()
  expect(console.warn).not.toHaveBeenCalled()
})

it('should have network without responses using MSW', async () => {
  configure({ mount: render })
  wrap(MyComponentWithNetwork).withNetwork().mount()

  expect(await screen.findByText('SUCCESS')).toBeInTheDocument()
})

it('should resolve a request with delay after the specified time using MSW', async () => {
  configure({ mount: render })
  vi.useFakeTimers({ shouldAdvanceTime: true })
  wrap(MyComponentWithNetwork)
    .withNetwork([
      {
        path: '/path/',
        host: 'api.test',
        responseBody: 'SUCCESS',
      },
      {
        path: '/path/with/response/',
        host: 'api.test',
        responseBody: '15',
        delay: 500,
      },
    ])
    .mount()

  await screen.findByText('MyComponentWithNetwork')
  vi.advanceTimersByTime(200)
  await screen.findByText('SUCCESS')

  expect(screen.getByText('SUCCESS')).toBeInTheDocument()
  expect(screen.queryByText('15')).not.toBeInTheDocument()

  vi.advanceTimersByTime(500)
  await screen.findByText('15')

  expect(screen.getByText('15')).toBeInTheDocument()
  vi.useRealTimers()
})

it('should resolve all the responses waiting for an unrelated text using MSW', async () => {
  configure({ mount: render })
  wrap(MyComponentWithNetwork)
    .withNetwork([
      {
        path: '/path/',
        host: 'api.test',
        responseBody: 'SUCCESS',
      },
      {
        path: '/path/with/response/',
        host: 'api.test',
        responseBody: '15',
      },
    ])
    .mount()

  await screen.findByText('MyComponentWithNetwork')

  expect(screen.getByText('SUCCESS')).toBeInTheDocument()
  expect(screen.getByText('15')).toBeInTheDocument()
})

it('should match a request regardless the body order using MSW', async () => {
  configure({ mount: render })
  wrap(MyComponentWithPost)
    .withNetwork([
      {
        path: '/path/to/login/',
        host: 'api.test',
        method: 'POST',
        requestBody: {
          foo: 'foo',
          bar: 'bar',
          user: {
            password: 'secret',
            username: 'Fran',
          },
        },
        responseBody: 'Fran',
      },
    ])
    .mount()

  expect(await screen.findByText('Logged in as Fran')).toBeInTheDocument()
})

it('should mock multiple POST responses using MSW', async () => {
  configure({ mount: render })
  wrap(MyComponentWithFeedback)
    .withNetwork({
      host: 'api.test',
      path: '/path/to/save/',
      method: 'POST',
      multipleResponses: [
        { responseBody: { name: 'Fran Perea' } },
        { responseBody: { name: 'El que lo lea' } },
      ],
    })
    .mount()

  fireEvent.click(screen.getByText('save'))

  expect(await screen.findByText('Fran Perea')).toBeInTheDocument()

  fireEvent.click(screen.getByText('save'))

  expect(await screen.findByText('El que lo lea')).toBeInTheDocument()
})

it('should not ignore the query params by default using MSW', async () => {
  configure({ mount: render, defaultHost: 'api.test' })
  wrap(MyComponentMakingHttpCallsWithQueryParams)
    .withNetwork({
      path: '/path/with/query/params/?myAwesome=param',
      responseBody: '15',
    })
    .mount()

  expect(await screen.findByText('quantity: 15')).toBeInTheDocument()
})

it('should ignore the query params when is configured using MSW', async () => {
  configure({ mount: render, handleQueryParams: true })

  wrap(MyComponentMakingHttpCallsWithQueryParams)
    .withNetwork({ path: '/path/with/query/params/', responseBody: '15' })
    .mount()

  expect(await screen.findByText('quantity: 15')).toBeInTheDocument()
})

it('should ignore the query params when configured and the path have it using MSW', async () => {
  configure({ mount: render, defaultHost: 'api.test', handleQueryParams: true })

  wrap(MyComponentMakingHttpCallsWithQueryParams)
    .withNetwork({
      path: '/path/with/query/params/?myAwesome=param',
      responseBody: '15',
    })
    .mount()

  expect(await screen.findByText('quantity: 15')).toBeInTheDocument()
})

it('should not ignore the query params when catchParams is specified using MSW', async () => {
  configure({ mount: render })

  wrap(MyComponentMakingHttpCallsWithQueryParams)
    .withNetwork({
      path: '/path/with/query/params/?myAwesome=param',
      responseBody: '15',
      catchParams: true,
    })
    .mount()

  expect(await screen.findByText('quantity: 15')).toBeInTheDocument()
})

it.skip('should handle fetch default requests when a string is passed using MSW', async () => {
  const MyComponent = () => null
  configure({ mount: render })

  wrap(MyComponent)
    .withNetwork([{ path: '/foo/bar', responseBody: { foo: 'bar' } }])
    .mount()

  const response = await fetch('/foo/bar').then(response => response.json())

  expect(response).toEqual({ foo: 'bar' })
})

it.skip('should handle fetch requests with option when a string is passed using MSW', async () => {
  const MyComponent = () => null
  configure({ mount: render, defaultHost: 'api.test' })

  wrap(MyComponent)
    .withNetwork([
      { path: '/foo/bar', method: 'POST', responseBody: { foo: 'bar' } },
    ])
    .mount()

  const response = await fetch('/foo/bar', { method: 'POST' }).then(response =>
    response.json(),
  )

  expect(response).toEqual({ foo: 'bar' })
})

it.skip('matches requests even when the caller omits the host using MSW', async () => {
  configure({ mount: render })

  wrap(() => null)
    .withNetwork({ path: '/no-host', responseBody: { ok: true } })
    .mount()

  const response = await fetch('/no-host')
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ ok: true })
})
