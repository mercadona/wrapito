import { white, redBright, greenBright } from 'chalk'

import { getRequestMatcher } from './requestMatcher'
import { saveListOfResponses, addResponseAsUtilized, resetUtilizedResponses, addRequestMissingResponse, resetRequestsMissingResponse } from './notUtilizedResponses'

beforeEach(() => {
  global.fetch = jest.fn()
})

afterEach(() => {
  global.fetch.mockRestore()
})

async function getNormalizedRequestBody(request) {
  try {
    const normalizedRequestBody = await request.json()
    return normalizedRequestBody
  } catch (error) {
    return null
  }
}

const createResponse = async ({ responseBody, status = 200, headers }) => (
  Promise.resolve({
    json: () => Promise.resolve(responseBody),
    status,
    ok: status >= 200 && status <= 299,
    headers: new Headers({ 'Content-Type': 'application/json', ...headers }),
  })
)

function mockFetch(responses) {
  resetUtilizedResponses()
  resetRequestsMissingResponse()
  const listOfResponses = responses.length > 0 ? responses : [ responses ]
  saveListOfResponses(listOfResponses)

  global.fetch.mockImplementation(async request => {
    const normalizedRequestBody = await getNormalizedRequestBody(request)
    const responseMatchingRequest = listOfResponses.find(getRequestMatcher(request, normalizedRequestBody))

    if (!responseMatchingRequest) {
      console.warn(`
${ white.bold.bgRed('burrito') } ${ redBright.bold('cannot find any mock matching:') }

  URL: ${ greenBright(request.url) }
  METHOD: ${ greenBright(request.method.toLowerCase()) }
  REQUEST BODY: ${ greenBright(JSON.stringify(normalizedRequestBody)) }
    `)

      addRequestMissingResponse({
        url: request.url,
        method: request.method.toLowerCase(),
        requestBody: normalizedRequestBody,
      })
      return
    }

    const { multipleResponses } = responseMatchingRequest
    if (!multipleResponses) {
      addResponseAsUtilized(responseMatchingRequest)
      return createResponse(responseMatchingRequest)
    }

    const responseNotYetReturned = multipleResponses.find(({ hasBeenReturned }) => !hasBeenReturned)
    if (!responseNotYetReturned) {
      console.warn(`
${ white.bold.bgRed('burrito') } ${ redBright.bold('all responses have been returned already given:') }

  URL: ${ greenBright(request.url) }
  METHOD: ${ greenBright(request.method.toLowerCase()) }
  REQUEST BODY: ${ greenBright(JSON.stringify(normalizedRequestBody)) }
      `)

      addRequestMissingResponse({
        url: request.url,
        method: request.method.toLowerCase(),
        requestBody: normalizedRequestBody,
      })
      return
    }

    responseNotYetReturned.hasBeenReturned = true
    addResponseAsUtilized(responseMatchingRequest)
    return createResponse(responseNotYetReturned)
  })
}

export { mockFetch }
