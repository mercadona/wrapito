const hasBeenFetched = path => {
  return fetch.mock.calls.find(([mockedPath]) => mockedPath === path)
}

const findRequestByPath = path =>
  fetch.mock.calls.find(([mockedPath]) => mockedPath === path)

const getRequestMethod = request => request[1].method

const getRequestBody = request => request[1].body

const isMethodDifferent = (options, targetRequestMethod) =>
  options?.method && targetRequestMethod !== options.method

const isBodyDifferent = (options, targetRequestBody) => {
  if (options?.body === undefined) return false

  const targetRequestBodyEntries = Object.entries(targetRequestBody).sort()
  const optionsBodyEntries = Object.entries(options.body).sort()

  return (
    JSON.stringify(targetRequestBodyEntries) !==
    JSON.stringify(optionsBodyEntries)
  )
}

const globalFetchAssertions = {
  toHaveBeenFetched(path) {
    if (hasBeenFetched(path)) {
      return { message: () => undefined, pass: true }
    }

    return { pass: false, message: () => `${path} ain't got called` }
  },

  toHaveBeenFetchedWith(path, options) {
    const targetRequest = findRequestByPath(path)

    if (!targetRequest) {
      return { pass: false, message: () => `${path} ain't got called` }
    }

    const targetRequestMethod = getRequestMethod(targetRequest)

    if (isMethodDifferent(options, targetRequestMethod)) {
      return {
        pass: false,
        message: () =>
          `fetch method does not match, expected ${options.method} received ${targetRequestMethod}`,
      }
    }

    const targetRequestBody = getRequestBody(targetRequest)

    if (isBodyDifferent(options, targetRequestBody)) {
      return {
        pass: false,
        message: () => `Fetch body does not match`,
      }
    }

    return { message: () => undefined, pass: true }
  },
}

export { globalFetchAssertions }
