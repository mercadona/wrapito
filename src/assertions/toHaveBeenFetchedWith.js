const findRequestsByPath = path =>
  fetch.mock.calls.filter(([mockedPath]) => mockedPath === path)

const getRequestsMethods = requests =>
  requests.map(request => request[1]?.method)

const getRequestBody = requests => requests[0][1]?.body

const methodDoesNotMatch = (expectedMethod, targetRequestsMethods) =>
  expectedMethod && !targetRequestsMethods.includes(expectedMethod)

const isBodyDifferent = (optionsBody, targetRequestBody) => {
  if (!optionsBody) return false

  const targetRequestBodyEntries = Object.entries(targetRequestBody).sort()
  const optionsBodyEntries = Object.entries(optionsBody).sort()

  return (
    JSON.stringify(targetRequestBodyEntries) !==
    JSON.stringify(optionsBodyEntries)
  )
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

  const targetRequestBody = getRequestBody(targetRequests)

  if (isBodyDifferent(options?.body, targetRequestBody)) {
    return {
      pass: false,
      message: () =>
        `Fetch body does not match, expected ${JSON.stringify(
          options.body,
        )} received ${JSON.stringify(targetRequestBody)}`,
    }
  }

  return { message: () => undefined, pass: true }
}

export { toHaveBeenFetchedWith }
