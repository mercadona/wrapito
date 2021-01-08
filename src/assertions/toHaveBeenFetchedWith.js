const findRequestsByPath = path =>
  fetch.mock.calls.filter(call => call[0].url.includes(path))

const getRequestsMethods = requests =>
  requests.map(request => request[0]?.method)

const getRequestsBodies = async requests =>
  Promise.all(
    requests.map(request =>
      request[0]
        .clone()
        .json()
        .catch(_ => undefined),
    ),
  )

const methodDoesNotMatch = (expectedMethod, receivedRequestsMethods) =>
  expectedMethod && !receivedRequestsMethods.includes(expectedMethod)

const bodyDoesNotMatch = (expectedBody, receivedRequestsBodies) => {
  if (!expectedBody) return false

  const comparableExpectedBody = Object.entries(expectedBody)
    .sort()
    .join()

  const comparableTargetRequestsBodies = receivedRequestsBodies.map(request =>
    Object.entries(request).sort().join(),
  )

  return !comparableTargetRequestsBodies.includes(comparableExpectedBody)
}

const empty = requests => requests.length === 0

const toHaveBeenFetchedWith = async (path, options) => {
  const targetRequests = findRequestsByPath(path)

  if (empty(targetRequests)) {
    return { pass: false, message: () => `${path} ain't got called` }
  }

  const receivedRequestsMethods = getRequestsMethods(targetRequests)
  const expectedMethod = options?.method

  if (methodDoesNotMatch(expectedMethod, receivedRequestsMethods)) {
    return {
      pass: false,
      message: () =>
        `Fetch method does not match, expected ${expectedMethod} received ${receivedRequestsMethods}`,
    }
  }

  const receivedRequestsBodies = await getRequestsBodies(targetRequests)
  const expectedBody = options?.body

  if (bodyDoesNotMatch(expectedBody, receivedRequestsBodies)) {
    return {
      pass: false,
      message: () =>
        `Fetch body does not match, expected ${JSON.stringify(
          expectedBody,
        )} received ${JSON.stringify(receivedRequestsBodies)}`,
    }
  }

  return { message: () => undefined, pass: true }
}

export { toHaveBeenFetchedWith }
