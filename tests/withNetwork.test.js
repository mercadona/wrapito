import { render, screen } from '@testing-library/react'
import { wrap, configure } from '../src/index'

import { MyComponentWithNetwork } from './components.mock'

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

it('should not resolve a request with delay', async () => {
  configure({ mount: render })
  jest.useFakeTimers()
  wrap(MyComponentWithNetwork)
    .withNetwork(
      {
        path: '/path/with/response/',
        host: 'my-host',
        responseBody: '15',
        delay: 500,
      },
    )
    .mount()

  await screen.findByText('SUCCESS')

  expect(screen.getByText('SUCCESS')).toBeInTheDocument()
  expect(screen.queryByText('15')).not.toBeInTheDocument()

  jest.advanceTimersByTime(500)
  await screen.findByText('15')

  expect(screen.getByText('15')).toBeInTheDocument()
  jest.useRealTimers()
})
