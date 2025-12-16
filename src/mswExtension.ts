import { http, HttpResponse, delay } from 'msw'
import { setupServer } from 'msw/node'

import { getRequestMatcher } from './requestMatcher'
import type {
  NetworkMocker,
  Response as WrapResponse,
  WrapExtensionAPI,
  WrapRequest,
} from './models'

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

const createRequestMatcherHandler = (
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

    const responseMatchingRequest = responses.find(
      getRequestMatcher(wrapRequest),
    )

    if (!responseMatchingRequest) {
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
      return createDefaultHttpResponse()
    }

    responseNotYetReturned.hasBeenReturned = true
    return createHttpResponse(responseNotYetReturned)
  })

let server = setupServer()
let serverStarted = false

const createMswNetworkMocker = (): NetworkMocker => {
  return (responses: WrapResponse[] = [], debug: boolean = false) => {
    if (!serverStarted) {
      server.listen({ onUnhandledRequest: 'bypass' })
      serverStarted = true
    }

    server.resetHandlers()
    server.use(createRequestMatcherHandler(responses, debug))
  }
}

const createMswExtension = () => {
  const networkMocker = createMswNetworkMocker()

  return (
    { addResponses, setNetworkMocker }: WrapExtensionAPI,
    responses: any,
  ) => {
    const responsesList = responses
      ? Array.isArray(responses)
        ? responses
        : [responses]
      : []
    addResponses(responsesList)
    setNetworkMocker?.(networkMocker)
  }
}

const mswExtension = createMswExtension()

export { mswExtension, createMswExtension, createMswNetworkMocker }
