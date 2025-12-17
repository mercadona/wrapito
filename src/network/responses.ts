import { delay, HttpResponse } from 'msw'
import type { Response as WrapResponse } from '../models'

const createDefaultHttpResponse = () =>
  HttpResponse.json(null, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

const createHttpResponse = async (mockResponse: Partial<WrapResponse>) => {
  const { responseBody, status = 200, headers = {}, delay: ms } = mockResponse

  if (ms) {
    await delay(ms)
  }

  return HttpResponse.json(responseBody ?? null, {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

export { createDefaultHttpResponse, createHttpResponse }