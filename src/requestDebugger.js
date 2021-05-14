import { getRequestMatcher } from './requestMatcher'

const matchesCurrentRequest = getRequestMatcher

const setupRequestDebugger = async mockedRequests => {
  global.fetch.mockImplementation(async request => {
    const requestHasBeenMocked = mockedRequests.some(
      matchesCurrentRequest(request),
    )

    if (!requestHasBeenMocked) {
      console.warn('The following request are not being handled:')
      console.warn(`url: ${request.url}`)
      console.warn(`method: ${request.method}`)
      console.warn(`body: ${request._bodyInit}`)
    }
  })
}

export { setupRequestDebugger }
