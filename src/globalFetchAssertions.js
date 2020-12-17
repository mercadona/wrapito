const globalFetchAssertions = {
  toHaveBeenFetched(inputValue) {
    const requests = fetch.mock.calls
    console.log(requests)

    if (requests.find( request => request[0] === inputValue)) {
      return { message: () => undefined, pass: true }
    }

    return { pass: false }
  },
}

export { globalFetchAssertions }
