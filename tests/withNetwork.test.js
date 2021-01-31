import { render, screen } from '@testing-library/react'
import { wrap, configure } from '../src/index'

import { MyComponentWithNetwork } from './components.mock'

it('should have network by default', async () => {
  configure({ mount: render })
  wrap(MyComponentWithNetwork).mount()

  expect(await screen.findByText('SUCCESS')).toBeInTheDocument()
})

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
