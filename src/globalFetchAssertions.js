const hasBeenFetched = (path) => {
  return fetch.mock.calls.find(([ mockedPath ]) => mockedPath === path)
}

const globalFetchAssertions = {
  toHaveBeenFetched(path) {

    if (hasBeenFetched(path)) {
      return { message: () => undefined, pass: true }
    }

    return { pass: false, message: () => `${path} ain't got called` }
  },
}

export { globalFetchAssertions }
