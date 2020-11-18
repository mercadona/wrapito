import { render, screen } from '@testing-library/react'
import { mockFetch } from '../src/mockFetch'
import { wrap, configure } from '../src/index'

import { MyComponentWithNetwork, MyComponentWithLogin } from './components.mock'

it('should have network', async () => {
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

it('should have network without responses', async () => {
  configure({ mount: render })
  wrap(MyComponentWithNetwork).withNetwork().mount()

  expect(await screen.findByText('SUCCESS')).toBeInTheDocument()
})

it('should extend burrito', async () => {
  const otherCustomExtension = jest.fn()
  const customArgs = { foo: 'bar' }
  configure({
    mount: render,
    extend: {
      withCustomExtension: () =>
        mockFetch([
          {
            path: '/path/to/login/',
            host: 'my-host',
            method: 'post',
            responseBody: 'Perizote',
          },
        ]),
      withOtherCustomExtension: () => otherCustomExtension(customArgs),
    },
  })
  wrap(MyComponentWithLogin)
    .withCustomExtension()
    .withOtherCustomExtension()
    .mount()

  expect(await screen.findByText('Logged as Perizote')).toBeInTheDocument()
  expect(otherCustomExtension).toHaveBeenCalledWith(customArgs)
})
