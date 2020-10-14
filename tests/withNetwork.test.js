import { render, screen } from '@testing-library/react'
import { wrap, configure } from '../src/index'

import { MyComponentMakingHttpCalls } from './components.mock'

fit('should have network', async () => {
  configure({ mount: render })
  wrap(MyComponentMakingHttpCalls)
    .withNetwork({ method: 'get', path: '/path/to/get/quantity/', host: 'my-host', responseBody: '15', status: 200 })
    .mount()

  expect(await screen.findByText('quantity: 15')).toBeInTheDocument()
})
