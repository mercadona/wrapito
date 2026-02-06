import { http } from 'msw'
import { setupServer } from 'msw/node'
import { clearRequestLog, recordRequestCall } from './requestLog'
import type { Response as WrapResponse } from '../@types/models'
import {
  buildHttpResponse,
  createRecordedRequest,
  createWrapRequest,
  extractRequestBody,
  findMatchingResponse,
} from './interceptHelpers'

const interceptNetworkRequests = (
  mockedResponses: WrapResponse[],
  debug: boolean,
) =>
  http.all('*', async ({ request: interceptedRequest }) => {
    const body = await extractRequestBody(interceptedRequest)
    const wrapRequest = createWrapRequest(interceptedRequest, body)

    const recordedRequest = createRecordedRequest(interceptedRequest, body)
    recordRequestCall(recordedRequest)

    const matchingResponse = findMatchingResponse(mockedResponses, wrapRequest)
    return buildHttpResponse(matchingResponse, wrapRequest, debug)
  })

let server = setupServer()
let serverStarted = false

const createMswNetworkMocker = () => {
  return (mockedResponses: WrapResponse[] = [], debug: boolean = false) => {
    if (!serverStarted) {
      server.listen({ onUnhandledRequest: 'bypass' })
      serverStarted = true
    }

    clearRequestLog()
    server.resetHandlers()
    server.use(interceptNetworkRequests(mockedResponses, debug))
  }
}

export { createMswNetworkMocker }
