import { getRequestMatcher } from './requestMatcher'

const setupRequestDebugger = async mockedRequests => {
  global.fetch.mockImplementation(async request => {
    const isMatchingCurrentRequest = getRequestMatcher(request)
    const requestHasBeenMocked = mockedRequests.some(isMatchingCurrentRequest)

    if (!requestHasBeenMocked) {
      console.warn('The following request is not being handled:')
      console.warn(`url: ${request.url}`)
      console.warn(`method: ${request.method}`)
      console.warn(`body: ${request._bodyInit}`)
    }
  })
}

export { setupRequestDebugger }
