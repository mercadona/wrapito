import { render, screen } from '@testing-library/react'
import { mockNetwork } from '../src/mockNetwork'
import { wrap, configure } from '../src/index'

import { MyComponentWithLogin } from './components.mock'

it('should extend burrito', async () => {
  const otherCustomExtension = jest.fn()
  const customArgs = { foo: 'bar' }
  configure({
    mount: render,
    extend: {
      withCustomExtension: () =>
        mockNetwork([
          {
            path: '/path/to/login/',
            host: 'my-host',
            method: 'post',
            responseBody: 'Fran Perea',
          },
        ]),
      withOtherCustomExtension: () => otherCustomExtension(customArgs),
    },
  })
  wrap(MyComponentWithLogin)
    .withCustomExtension()
    .withOtherCustomExtension()
    .mount()

  expect(await screen.findByText('Logged as Fran Perea')).toBeInTheDocument()
  expect(otherCustomExtension).toHaveBeenCalledWith(customArgs)
})
