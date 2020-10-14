import { wrap } from '@mercadona/mo.library.burrito'
import { screen } from '@testing-library/react'

import { App } from 'app.js'

it('should ', async () => {
  await wrap(App)
    .atPath('')
    .withMocks([
      {
        path: '',
      },
    ])
    .waitUntil(() => screen.findByText('PASILLO'))
    .mount()

  expect().toBeInTheDocument()
})

it('should ', async () => {
  await wrap(App)
    .atPath('')
    .withMocks([
      {
        path: '',
      },
    ])
    .mount()

  await screen.findByText('PASILLO')

  expect().toBeInTheDocument()
})
