import { http } from 'msw'
import { setupServer } from 'msw/node'
import { getRequestMatcher } from './requestMatcher'
import { clearRequestLog, recordRequestCall } from './requestLog'
import type { Response as WrapResponse, WrapRequest } from '../@types/models'
import { createDefaultHttpResponse, createHttpResponse } from './responses'
import { printRequest } from './printRequest'

const interceptNetworkRequests = (
  responses: WrapResponse[],
  debug: boolean,
) =>
  http.all('*', async ({ request }) => {
    const body = await request.text()

    const wrapRequest: WrapRequest = {
      url: request.url,
      method: request.method,
      _bodyInit: body || undefined,
    }

    const recordedRequest = new Request(wrapRequest.url, {
      method: request.method,
      headers: request.headers,
      body: body || undefined,
    })
    if (body) {
      // Preserve the same private field our matchers inspect for request bodies
      ;(recordedRequest as any)._bodyInit = body
    }
    recordRequestCall(recordedRequest)

    const responseMatchingRequest = responses.find(
      getRequestMatcher(wrapRequest),
    )

    if (!responseMatchingRequest) {
      if (debug) {
        printRequest(wrapRequest)
      }

      return createDefaultHttpResponse()
    }

    const { multipleResponses } = responseMatchingRequest
    if (!multipleResponses) {
      return createHttpResponse(responseMatchingRequest)
    }

    const responseNotYetReturned = multipleResponses.find(
      response => !response.hasBeenReturned,
    )

    if (!responseNotYetReturned) {
      if (debug) {
        printRequest(wrapRequest)
      }

      return createDefaultHttpResponse()
    }

    responseNotYetReturned.hasBeenReturned = true
    return createHttpResponse(responseNotYetReturned)
  })

let server = setupServer()
let serverStarted = false

const createMswNetworkMocker = () => {
  return (responses: WrapResponse[] = [], debug: boolean = false) => {
    if (!serverStarted) {
      server.listen({ onUnhandledRequest: 'bypass' })
      serverStarted = true
    }

    clearRequestLog()
    server.resetHandlers()
    server.use(interceptNetworkRequests(responses, debug))
  }
}

export { createMswNetworkMocker }
