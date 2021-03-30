import { getRequestMatcher } from './requestMatcher'

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

const createResponse = async ({ responseBody, status = 200, headers, delay = 0 }) => {
  return new Promise(resolve => setTimeout(() => {
    return resolve({
      json: () => Promise.resolve(responseBody),
      status,
      ok: status >= 200 && status <= 299,
      headers: new Headers({ 'Content-Type': 'application/json', ...headers }),
    })
  }, delay))
}

function mockNetwork(responses = []) {
  const listOfResponses = responses.length > 0 ? responses : [responses]
  global.fetch.mockImplementation(async request => {
    const normalizedRequestBody = await getNormalizedRequestBody(request)
    const responseMatchingRequest = listOfResponses.find(
      getRequestMatcher(request, normalizedRequestBody),
    )

    if (!responseMatchingRequest) {
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
