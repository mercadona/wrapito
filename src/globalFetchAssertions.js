const hasBeenFetched = path => {
  return fetch.mock.calls.find(([mockedPath]) => mockedPath === path)
}

const findRequestByPath = path =>
  fetch.mock.calls.find(([mockedPath]) => mockedPath === path)

const getRequestMethod = request => request[1].method

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

    if (targetRequestMethod !== options.method) {
      return {
        pass: false,
        message: () =>
          `fetch method does not match, expected ${options.method} received ${targetRequestMethod}`,
      }
    }

    return { message: () => undefined, pass: true }
  },
}

export { globalFetchAssertions }
