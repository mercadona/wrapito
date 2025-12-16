import { render, screen } from '@testing-library/react'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import { configure, wrap } from '../../src'
import { MyComponentWithNetwork } from '../components.mock'

describe('withMSW builder', () => {
  beforeEach(() => {
    configure({
      mount: render,
    })
  })

  it('mocks requests using msw by calling withMSW', async () => {
    const responses = [
      { path: '/path/', host: 'my-host', responseBody: 'SUCCESS' },
      { path: '/path/with/response/', host: 'my-host', responseBody: 15 },
    ]

    wrap(MyComponentWithNetwork).withMSW(responses).mount()

    expect(await screen.findByText('SUCCESS')).toBeInTheDocument()
    expect(await screen.findByText('15')).toBeInTheDocument()
  })
})
