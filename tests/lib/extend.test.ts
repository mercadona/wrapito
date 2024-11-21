import { render, screen, fireEvent } from '@testing-library/react'
import { vi, it, expect } from 'vitest'
import { wrap, configure } from '../../src/index'

import { MyComponentWithLogin } from '../components.mock'

it('should extend wrapito', async () => {
  const otherCustomExtension = vi.fn()
  const customArgs = { foo: 'bar' }
  configure({
    mount: render,
    extend: {
      withLogin: ({ addResponses }, username: string) =>
        addResponses([
          {
            path: '/path/to/login/',
            host: 'my-host',
            method: 'POST',
            responseBody: username,
          },
        ]),
      withOtherCustomExtension: () => otherCustomExtension(customArgs),
    },
  })
  wrap(MyComponentWithLogin)
    .withLogin('Fran Perea')
    .withOtherCustomExtension()
    .mount()

  expect(await screen.findByText('Logged in as Fran Perea')).toBeInTheDocument()
  expect(otherCustomExtension).toHaveBeenCalledWith(customArgs)
})

it('should be compatible with withNetwork', async () => {
  configure({
    mount: render,
    extend: {
      withLogin: ({ addResponses }, username) =>
        addResponses([
          {
            path: '/path/to/login/',
            host: 'my-host',
            method: 'POST',
            responseBody: username,
          },
        ]),
    },
  })
  wrap(MyComponentWithLogin)
    .withLogin('Fran Perea')
    .withNetwork([
      {
        path: '/path/to/logout/',
        host: 'my-host',
        method: 'POST',
        responseBody: 'John Doe',
      },
    ])
    .mount()

  await screen.findByText('Logged in as Fran Perea')
  fireEvent.click(screen.getByText('Logout'))

  expect(await screen.findByText('Logged out as John Doe')).toBeInTheDocument()
})

it('should be composable', async () => {
  configure({
    mount: render,
    extend: {
      withLogin: ({ addResponses }, username) =>
        addResponses([
          {
            path: '/path/to/login/',
            host: 'my-host',
            method: 'POST',
            responseBody: username,
          },
        ]),
    },
  })
  wrap(MyComponentWithLogin)
    .withNetwork([
      {
        path: '/path/to/logout/',
        host: 'my-host',
        method: 'POST',
        responseBody: 'John Doe',
      },
    ])
    .withLogin('Fran Perea')
    .mount()

  await screen.findByText('Logged in as Fran Perea')
  fireEvent.click(screen.getByText('Logout'))

  expect(await screen.findByText('Logged out as John Doe')).toBeInTheDocument()
})
