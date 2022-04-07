import chalk from 'chalk'
import { Response, Request } from './models'
import { getRequestMatcher } from './requestMatcher'

declare global {
  interface Window {
    fetch: jest.Mock
  }
}

beforeEach(() => {
  global.window.fetch = jest.fn()
})

afterEach(() => {
  global.window.fetch.mockRestore()
})

const createDefaultResponse = async () => {
  const response = {
    json: () => Promise.resolve(),
    status: 200,
    ok: true,
    headers: new Headers({ 'Content-Type': 'application/json' }),
  }

  return Promise.resolve(response)
}

const createResponse = async (mockResponse: Response) => {
  const {
    responseBody,
    status = 200,
    headers,
    delay,
  } = mockResponse
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

const printRequest = (request: Request) => {
  return console.warn(`
${chalk.white.bold.bgRed('wrapito')} ${chalk.redBright.bold(
    'cannot find any mock matching:',
  )}
  ${chalk.greenBright(`URL: ${request.url}`)}
  ${chalk.greenBright(`METHOD: ${request.method.toLowerCase()}`)}
  ${chalk.greenBright(`REQUEST BODY: ${request._bodyInit}`)}
 `)
}

const mockFetch = async (responses: Response[], request: Request, debug: boolean) => {
  const responseMatchingRequest = responses.find(
    getRequestMatcher(request),
  )

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
    (response: Response) => !response.hasBeenReturned,
  )
  if (!responseNotYetReturned) return

  responseNotYetReturned.hasBeenReturned = true
  return createResponse(responseNotYetReturned)
}

const mockNetwork = (responses: Response[] = [], debug: boolean = false) => {
  const fetch = global.window.fetch

  fetch.mockImplementation(request => mockFetch(responses, request, debug))
}

export { mockNetwork }
