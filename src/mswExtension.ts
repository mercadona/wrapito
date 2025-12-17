import { delay, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import chalk from 'chalk'
import { getRequestMatcher } from './requestMatcher'
import { clearRequestLog, recordRequestCall } from './utils/requestLog'
import type { Response as WrapResponse, WrapRequest } from './models'

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

const normalizeUrl = (rawUrl: string, defaultHost: string) => {
  const fallbackHost = defaultHost || 'http://localhost'
  const hasProtocol = /^https?:\/\//i.test(rawUrl)
  if (hasProtocol) return rawUrl

  if (rawUrl.startsWith('/')) {
    try {
      return new URL(rawUrl, fallbackHost).toString()
    } catch {
      return rawUrl
    }
  }

  // Treat as host without protocol
  return `http://${rawUrl}`
}

const printRequest = (request: WrapRequest) => {
  return console.warn(`
${chalk.white.bold.bgRed('wrapito')} ${chalk.redBright.bold(
    'cannot find any mock matching:',
  )}
  ${chalk.greenBright(`URL: ${request.url}`)}
  ${chalk.greenBright(`METHOD: ${request.method?.toLowerCase()}`)}
  ${chalk.greenBright(`REQUEST BODY: ${request._bodyInit}`)}
 `)
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
    server.use(createRequestMatcherHandler(responses, debug))
  }
}

export { createMswNetworkMocker }
