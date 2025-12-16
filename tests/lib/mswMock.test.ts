import { afterEach, expect, it } from 'vitest'
import { mockRequestsWithMSW } from '../../src/mswMock'

let stop: (() => void) | undefined

afterEach(() => {
  stop?.()
  stop = undefined
})

it('mocks a GET request with msw', async () => {
  stop = mockRequestsWithMSW([
    {
      method: 'GET',
      url: 'http://api.test/products/1',
      responseBody: { id: 1, name: 'Hummus' },
    },
  ])

  const response = await fetch('http://api.test/products/1')
  const body = await response.json()

  expect(body).toEqual({ id: 1, name: 'Hummus' })
  expect(response.status).toBe(200)
})

it('matches request body for POST', async () => {
  stop = mockRequestsWithMSW([
    {
      method: 'POST',
      url: 'http://api.test/products',
      requestBody: { id: 2 },
      responseBody: { ok: true },
    },
  ])

  const response = await fetch('http://api.test/products', {
    method: 'POST',
    body: JSON.stringify({ id: 2 }),
  })

  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ ok: true })
})
