const findRequestsByPath = path =>
  fetch.mock.calls.filter(call => call[0].url.includes(path))

const getRequestsMethods = requests =>
  requests.map(request => request[1]?.method)

const getRequestsBodies = async requests =>
  Promise.all(
    requests.map(request =>
      request[0]
        .clone()
        .json()
        .catch(_ => undefined),
    ),
  )

const methodDoesNotMatch = (expectedMethod, targetRequestsMethods) =>
  expectedMethod && !targetRequestsMethods.includes(expectedMethod)

const bodyDoesNotMatch = (expectedBody, targetRequestsBodies) => {
  if (!expectedBody) return false

  const comparableExpectedBody = Object.entries(expectedBody)
    .sort()
    .flat()
    .join()

  const comparableTargetRequestsBodies = targetRequestsBodies.map(request =>
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

  const targetRequestsMethods = getRequestsMethods(targetRequests)
  const expectedMethod = options?.method

  if (methodDoesNotMatch(expectedMethod, targetRequestsMethods)) {
    return {
      pass: false,
      message: () =>
        `Fetch method does not match, expected ${options.method} received ${targetRequestsMethods}`,
    }
  }

  const targetRequestsBodies = await getRequestsBodies(targetRequests)
  const expectedBody = options?.body

  if (bodyDoesNotMatch(expectedBody, targetRequestsBodies)) {
    return {
      pass: false,
      message: () =>
        `Fetch body does not match, expected ${JSON.stringify(
          options.body,
        )} received ${JSON.stringify(targetRequestsBodies)}`,
    }
  }

  return { message: () => undefined, pass: true }
}

export { toHaveBeenFetchedWith }
