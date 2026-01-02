import chalk from 'chalk'
import type { Response, WrapRequest } from './models'
import { getRequestMatcher } from './requestMatcher'
import { enhancedSpy } from './utils/tinyspyWrapper'
import { createDefaultFetchResponse } from './utils/defaultFetchResponse'
import type { MockInstance } from '../src/utils/types'

declare global {
  interface Window {
    fetch: MockInstance
  }
}

let originalGlobalFetch: typeof globalThis.fetch | undefined
let originalWindowFetch: typeof globalThis.fetch | undefined

beforeEach(() => {
  originalGlobalFetch = globalThis.fetch
  if (typeof window !== 'undefined') {
    originalWindowFetch = window.fetch
  }
  // @ts-expect-error
  const mockedFetch = enhancedSpy(() =>
    Promise.resolve(createDefaultFetchResponse()),
  )
  // @ts-expect-error
  globalThis.fetch = mockedFetch
  if (typeof window !== 'undefined') {
    // @ts-expect-error
    window.fetch = mockedFetch
  }
})

afterEach(() => {
  const mockedFetch = globalThis.fetch as unknown as MockInstance | undefined
  if (mockedFetch?.mockRestore) {
    mockedFetch.mockRestore()
  }

  const restoredFetch = originalGlobalFetch ?? originalWindowFetch
  // Avoid restoring to undefined; keep a usable fetch to prevent late async crashes.
  globalThis.fetch = restoredFetch ?? globalThis.fetch
  if (typeof window !== 'undefined') {
    window.fetch = originalWindowFetch ?? originalGlobalFetch ?? globalThis.fetch
  }
})

const createDefaultResponse = async () => {
  return Promise.resolve(createDefaultFetchResponse())
}

const createResponse = async (mockResponse: Partial<Response>) => {
  const { responseBody, status = 200, headers = {}, delay } = mockResponse
  const response = {
    json: () => Promise.resolve(responseBody),
    status,
    ok: status >= 200 && status <= 299,
    headers: new Headers({ 'Content-Type': 'application/json', ...headers }),
  }

  if (!delay) return Promise.resolve(response)

  return new Promise(resolve =>
    setTimeout(() => {
      return resolve(response)
    }, delay),
  )
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

const mockFetch = async (
  responses: Response[],
  request: WrapRequest,
  debug: boolean,
) => {
  const responseMatchingRequest = responses.find(getRequestMatcher(request))

  if (!responseMatchingRequest) {
    if (debug) {
      printRequest(request)
    }

    return createDefaultResponse()
  }

  const { multipleResponses } = responseMatchingRequest
  if (!multipleResponses) {
    return createResponse(responseMatchingRequest)
  }

  const responseNotYetReturned = multipleResponses.find(
    response => !response.hasBeenReturned,
  )

  if (!responseNotYetReturned) {
    if (debug) {
      printMultipleResponsesWarning(responseMatchingRequest)
    }
    return createDefaultResponse()
  }

  responseNotYetReturned.hasBeenReturned = true
  return createResponse(responseNotYetReturned)
}

const mockNetwork = (responses: Response[] = [], debug: boolean = false) => {
  const fetch = globalThis.fetch

  fetch.mockImplementation((input: WrapRequest, init?: RequestInit) => {
    if (typeof input === 'string') {
      const request = new Request(input, init)
      return mockFetch(responses, request, debug)
    }
    const request = input
    return mockFetch(responses, request, debug)
  })
}

const printMultipleResponsesWarning = (response: Response) => {
  const errorMessage = `🌯 Wrapito:  Missing response in the multipleResponses array for path ${response.path} and method ${response.method}.`
  const formattedErrorMessage = chalk.greenBright(errorMessage)

  console.warn(formattedErrorMessage)
}

export { mockNetwork }
