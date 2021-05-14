const setupRequestDebugger = () => {
  global.fetch.mockImplementation(async request => {
    console.warn('your code is doing this requests')
    console.warn(request.url)
    console.warn(request.method)
    console.warn(`body: ${request._bodyInit}`)
  })
}

export { setupRequestDebugger }
