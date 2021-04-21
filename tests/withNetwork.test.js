import { render, screen } from '@testing-library/react'
import { wrap, configure } from '../src/index'

import { MyComponentWithNetwork, MyComponentWithPost } from './components.mock'

it('should have network by default', async () => {
  configure({ mount: render })
  wrap(MyComponentWithNetwork).mount()

  expect(await screen.findByText('SUCCESS')).toBeInTheDocument()
})

it('should have network with an array of requests', async () => {
  jest.spyOn(console, 'warn')
  configure({ mount: render })
  wrap(MyComponentWithNetwork)
    .withNetwork([
      { path: '/path/with/response/', host: 'my-host', responseBody: '15' },
    ])
    .mount()

  expect(await screen.findByText('SUCCESS')).toBeInTheDocument()
  expect(await screen.findByText('15')).toBeInTheDocument()
  expect(console.warn).not.toHaveBeenCalled()
})

it('should have network with an object of requests', async () => {
  jest.spyOn(console, 'warn')
  configure({ mount: render })
  wrap(MyComponentWithNetwork)
    .withNetwork(
      { path: '/path/with/response/', host: 'my-host', responseBody: '15' },
    )
    .mount()

  expect(await screen.findByText('SUCCESS')).toBeInTheDocument()
  expect(await screen.findByText('15')).toBeInTheDocument()
  expect(console.warn).not.toHaveBeenCalled()
})

it('should have network without responses', async () => {
  configure({ mount: render })
  wrap(MyComponentWithNetwork).withNetwork().mount()

  expect(await screen.findByText('SUCCESS')).toBeInTheDocument()
})

it('should resolve a request with delay after the specified time', async () => {
  configure({ mount: render })
  jest.useFakeTimers()
  wrap(MyComponentWithNetwork)
    .withNetwork([
      {
        path: '/path/',
        host: 'my-host',
        responseBody: 'SUCCESS',
      },
      {
        path: '/path/with/response/',
        host: 'my-host',
        responseBody: '15',
        delay: 500,
      },
    ])
    .mount()

  await screen.findByText('MyComponentWithNetwork')
  jest.advanceTimersByTime(200)
  await screen.findByText('SUCCESS')

  expect(screen.getByText('SUCCESS')).toBeInTheDocument()
  expect(screen.queryByText('15')).not.toBeInTheDocument()

  jest.advanceTimersByTime(500)
  await screen.findByText('15')

  expect(screen.getByText('15')).toBeInTheDocument()
  jest.useRealTimers()
})

it('should resolve all the responses waiting for an unrelated text', async () => {
  configure({ mount: render })
  wrap(MyComponentWithNetwork)
    .withNetwork([
      {
        path: '/path/',
        host: 'my-host',
        responseBody: 'SUCCESS',
      },
      {
        path: '/path/with/response/',
        host: 'my-host',
        responseBody: '15',
      },
    ])
    .mount()

  await screen.findByText('MyComponentWithNetwork')

  expect(screen.getByText('SUCCESS')).toBeInTheDocument()
  expect(screen.getByText('15')).toBeInTheDocument()
})

it('should match a request regardless the body order', async () => {
  configure({ mount: render })
  wrap(MyComponentWithPost).withNetwork([{
    path: '/path/to/login/',
    host: 'my-host',
    method: 'post',
    requestBody: { username: "Fran", password: "secret" },
    responseBody: 'Fran',
  }]).mount()

  expect(await screen.findByText('Logged in as Fran')).toBeInTheDocument()
})
