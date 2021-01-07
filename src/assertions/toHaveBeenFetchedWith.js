const findRequestsByPath = path =>
  fetch.mock.calls.filter(([mockedPath]) => mockedPath.includes(path))

const getRequestsMethods = requests =>
  requests.map(request => request[1]?.method)

const getRequestsBodies = requests => requests.map(request => request[1]?.body)

const methodDoesNotMatch = (expectedMethod, targetRequestsMethods) =>
  expectedMethod && !targetRequestsMethods.includes(expectedMethod)

const bodyDoesNotMatch = (expectedBody, targetRequestsBodies) => {
  if (!expectedBody) return false

  const expectedBodyEntries = JSON.stringify(
    Object.entries(expectedBody).sort(),
  )
  const targetRequestBodyEntries = targetRequestsBodies.map(request =>
    JSON.stringify(Object.entries(request).sort()),
  )

  return !targetRequestBodyEntries.includes(expectedBodyEntries)
}

const empty = requests => requests.length === 0

const toHaveBeenFetchedWith = (path, options) => {
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

  const targetRequestsBodies = getRequestsBodies(targetRequests)
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
