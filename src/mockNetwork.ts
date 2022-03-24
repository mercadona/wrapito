// @ts-nocheck
import { white, redBright, greenBright } from 'chalk'
import { Response } from './models'
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

const createResponse = async ({
  responseBody,
  status = 200,
  headers,
  delay,
}) => {
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

const printRequest = request => {
  return console.warn(`
${white.bold.bgRed('wrapito')} ${redBright.bold(
    'cannot find any mock matching:',
  )}
  ${greenBright(`URL: ${request.url}`)}
  ${greenBright(`METHOD: ${request.method.toLowerCase()}`)}
  ${greenBright(`REQUEST BODY: ${request._bodyInit}`)}
 `)
}

function mockNetwork(responses: Response[] = [], debug: boolean = false) {
  const listOfResponses = responses.length > 0 ? responses : [responses]
  global.window.fetch.mockImplementation(async request => {
    const responseMatchingRequest = listOfResponses.find(
      getRequestMatcher(request),
    )

    if (!responseMatchingRequest) {
      if (debug) {
        printRequest(request)
      }

      return createResponse({})
    }

    const { multipleResponses } = responseMatchingRequest
    if (!multipleResponses) {
      return createResponse(responseMatchingRequest)
    }

    const responseNotYetReturned = multipleResponses.find(
      ({ hasBeenReturned }) => !hasBeenReturned,
    )
    if (!responseNotYetReturned) return

    responseNotYetReturned.hasBeenReturned = true
    return createResponse(responseNotYetReturned)
  })
}

export { mockNetwork }
