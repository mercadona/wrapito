import deepEqual from 'deep-equal'
import { getMocksConfig } from './config'

global.fetch = jest.fn()

async function getNormalizedRequestBody(request) {
  try {
    const normalizedRequestBody = await request.json()
    return normalizedRequestBody
  } catch (error) {
    return null
  }
}

const matchesRequestMethod = (request, method) => request.method.toLowerCase() === method
const matchesRequestUrl = (request, url) => request.url === url
const matchesRequestBody = (normalizedRequestBody, requestBody) => {
  return deepEqual(normalizedRequestBody, requestBody)
}

const getRequestMatcher = (request, normalizedRequestBody) => ({
  method = 'get',
  path,
  host = getMocksConfig().defaultHost,
  requestBody = null,
}) => {
  const url = host + path

  return (
    matchesRequestMethod(request, method) &&
    matchesRequestUrl(request, url) &&
    matchesRequestBody(normalizedRequestBody, requestBody)
  )
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
  const listOfResponses = responses.length > 0 ? responses : [ responses ]

  global.fetch.mockImplementation(async request => {
    const normalizedRequestBody = await getNormalizedRequestBody(request)
    const responseMatchingRequest = listOfResponses.find(getRequestMatcher(request, normalizedRequestBody))

    if (!responseMatchingRequest) { throw Error('cannot find any endpoint') }

    return createResponse(responseMatchingRequest)
  })
}

export { mockFetch }