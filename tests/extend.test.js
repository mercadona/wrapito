import { render, screen, fireEvent } from '@testing-library/react'
import { wrap, configure } from '../src/index'

import { MyComponentWithLogin } from './components.mock'

it('should extend burrito', async () => {
  const otherCustomExtension = jest.fn()
  const customArgs = { foo: 'bar' }
  configure({
    mount: render,
    extend: {
      withLogin: ({ mockNetwork }, username) =>
        mockNetwork([
          {
            path: '/path/to/login/',
            host: 'my-host',
            method: 'post',
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

it.only('should be compatible with withNetwork', async () => {
  configure({
    mount: render,
    extend: {
      withLogin: ({ addResponses }, username) =>
        addResponses([
          {
            path: '/path/to/login/',
            host: 'my-host',
            method: 'post',
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
        method: 'post',
        responseBody: 'John Doe',
      },
    ])
    .mount()

  await screen.findByText('Logged in as Fran Perea')
  fireEvent.click(screen.getByText('Logout'))

  expect(await screen.findByText('Logged out as John Doe')).toBeInTheDocument()
})
