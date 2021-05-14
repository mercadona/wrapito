import { getRequestMatcher } from './requestMatcher'

beforeEach(() => {
  global.fetch = jest.fn()
})

afterEach(() => {
  global.fetch.mockRestore()
})

const createResponse = async ({ responseBody, status = 200, headers, delay }) => {
  const response = {
    json: () => Promise.resolve(responseBody),
    status,
    ok: status >= 200 && status <= 299,
    headers: new Headers({ 'Content-Type': 'application/json', ...headers }),
  }

  if (!delay) return Promise.resolve(response)

  return new Promise(resolve => setTimeout(() => {
    return resolve(response)
  }, delay))
}

function mockNetwork(responses = [], debug = false) {
  const listOfResponses = responses.length > 0 ? responses : [responses]
  global.fetch.mockImplementation(async request => {
    const responseMatchingRequest = listOfResponses.find(
      getRequestMatcher(request),
    )

    if (!responseMatchingRequest) {
      if (debug) {
        console.warn('The following request is not being handled:')
        console.warn(`url: ${request.url}`)
        console.warn(`method: ${request.method}`)
        console.warn(`body: ${request._bodyInit}`)
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
