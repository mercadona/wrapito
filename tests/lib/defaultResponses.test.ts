import { render, screen } from '@testing-library/react'
import { configure, wrap } from '../../src/index'
import { it, expect } from 'vitest'

import { MyComponentWithNetwork } from '../components.mock'

it('should apply defaultResponses automatically on mount', async () => {
  configure({
    mount: render,
    defaultResponses: [
      {
        path: '/path/',
        host: 'my-host',
        responseBody: 'SUCCESS',
      },
      {
        path: '/path/with/response/',
        host: 'my-host',
        responseBody: '99',
      },
    ],
  })

  wrap(MyComponentWithNetwork).mount()

  expect(await screen.findByText('SUCCESS')).toBeInTheDocument()
  expect(await screen.findByText('99')).toBeInTheDocument()
})

it('should let test responses override defaultResponses for the same path', async () => {
  configure({
    mount: render,
    defaultResponses: [
      {
        path: '/path/with/response/',
        host: 'my-host',
        responseBody: '99',
      },
    ],
  })

  wrap(MyComponentWithNetwork)
    .withNetwork([
      {
        path: '/path/with/response/',
        host: 'my-host',
        responseBody: '42',
      },
    ])
    .mount()

  expect(await screen.findByText('42')).toBeInTheDocument()
})

it('should not leak defaultResponses between tests when reconfigured', async () => {
  configure({
    mount: render,
    defaultResponses: [],
  })

  wrap(MyComponentWithNetwork).mount()

  expect(await screen.findByText('SUCCESS')).toBeInTheDocument()
  expect(screen.queryByText('99')).not.toBeInTheDocument()
})
