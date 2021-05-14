const setupRequestDebugger = () => {
  global.fetch.mockImplementation(async request => {
    console.warn('The following request are not being handled:')
    console.warn(request.url)
    console.warn(request.method)
    console.warn(`body: ${request._bodyInit}`)
  })
}

export { setupRequestDebugger }
