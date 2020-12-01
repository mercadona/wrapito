import { render, screen } from '@testing-library/react'
import { mockFetch } from '../src/mockFetch'
import { wrap, configure } from '../src/index'

import { MyComponentWithLogin } from './components.mock'

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
