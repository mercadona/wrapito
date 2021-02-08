import deepEqual from 'deep-equal'

const findRequestsByPath = path =>
  fetch.mock.calls.filter(call => call[0].url.includes(path))

const getRequestsMethods = requests =>
  requests.map(request => request[0]?.method)

const getRequestsBodies = requests =>
  requests.map(request => {
    if (!request[0]._bodyInit) return {}

    return JSON.parse(request[0]._bodyInit)
  })

const methodDoesNotMatch = (expectedMethod, receivedRequestsMethods) =>
  expectedMethod && !receivedRequestsMethods.includes(expectedMethod)

const bodyDoesNotMatch = (expectedBody, receivedRequestsBodies) => {
  if (!expectedBody) return false

  const anyRequestMatch = receivedRequestsBodies
    .map(request => deepEqual(expectedBody, request))
    .every(requestCompare => requestCompare === false)

  return anyRequestMatch
}

const empty = requests => requests.length === 0

const toHaveBeenFetchedWith = (path, options) => {
  const targetRequests = findRequestsByPath(path)

  if (empty(targetRequests)) {
    return { pass: false, message: () => `${ path } ain't got called` }
  }

  const receivedRequestsMethods = getRequestsMethods(targetRequests)
  const expectedMethod = options?.method

  if (methodDoesNotMatch(expectedMethod, receivedRequestsMethods)) {
    return {
      pass: false,
      message: () =>
        `Fetch method does not match, expected ${ expectedMethod } received ${ receivedRequestsMethods }`,
    }
  }

  const receivedRequestsBodies = getRequestsBodies(targetRequests)
  const expectedBody = options?.body

  if (bodyDoesNotMatch(expectedBody, receivedRequestsBodies)) {
    return {
      pass: false,
      message: () =>
        `Fetch body does not match, expected ${ JSON.stringify(
          expectedBody,
        ) } received ${ JSON.stringify(receivedRequestsBodies) }`,
    }
  }

  return { message: () => undefined, pass: true }
}

export { toHaveBeenFetchedWith }
