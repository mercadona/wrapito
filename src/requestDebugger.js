import { getRequestMatcher } from './requestMatcher'

const setupRequestDebugger = async mockedRequests => {
  global.fetch.mockImplementation(async request => {
    const isMatchingRequest = mockedRequests.find(mockedRequest =>
      getRequestMatcher(request)(mockedRequest),
    )

    if (!isMatchingRequest) {
      console.warn('The following request are not being handled:')
      console.warn(request.url)
      console.warn(request.method)
      console.warn(`body: ${request._bodyInit}`)
    }
  })
}

export { setupRequestDebugger }
