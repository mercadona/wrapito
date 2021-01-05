const findRequestsByPath = path =>
  fetch.mock.calls.filter(([mockedPath]) => mockedPath === path)

const getRequestsMethods = requests =>
  requests.map(request => request[1]?.method)

const getRequestBody = requests => requests[0][1]?.body

const isMethodDifferent = (optionsMethod, targetRequestsMethods) =>
  optionsMethod && !targetRequestsMethods.includes(optionsMethod)

const isBodyDifferent = (optionsBody, targetRequestBody) => {
  if (!optionsBody) return false

  const targetRequestBodyEntries = Object.entries(targetRequestBody).sort()
  const optionsBodyEntries = Object.entries(optionsBody).sort()

  return (
    JSON.stringify(targetRequestBodyEntries) !==
    JSON.stringify(optionsBodyEntries)
  )
}

const toHaveBeenFetchedWith = (path, options) => {
  const targetRequests = findRequestsByPath(path)

  if (targetRequests.length === 0) {
    return { pass: false, message: () => `${path} ain't got called` }
  }

  const targetRequestsMethods = getRequestsMethods(targetRequests)

  if (isMethodDifferent(options?.method, targetRequestsMethods)) {
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
