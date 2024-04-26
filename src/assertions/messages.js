import diff from 'jest-diff'

const emptyErrorMessage = (path, options) => {
  const message = options?.host
    ? `🌯 Wrapito: ${options?.host}${path} ain't got called`
    : `🌯 Wrapito: ${path} ain't got called`

  return {
    pass: false,
    message: () => message,
  }
}

const fetchLengthErrorMessage = (path, expectLength, currentLength) => ({
  pass: false,
  message: () =>
    `🌯 Wrapito: ${path} is called ${currentLength} times, you expected ${expectLength} times`,
})

const methodDoesNotMatchErrorMessage = (expected, received) => ({
  pass: false,
  message: () =>
    `🌯 Wrapito: Fetch method does not match, expected ${expected} received ${received ?? 'none'}`,
})

const bodyDoesNotMatchErrorMessage = (expected, receivedBodies) => {
  const diffs = receivedBodies
    .map(received => diff(expected, received))
    .join('\n\n')

  return {
    pass: false,
    message: () =>
      `🌯 Wrapito: Fetch body does not match.
${diffs}`,
  }
}

const doesNotHaveBodyErrorMessage = () => ({
  pass: false,
  message: () => '🌯 Wrapito: Unable to find body.',
})

const successMessage = () => ({
  pass: true,
  message: () => undefined,
})

const haveBeenFetchedSuccessMessage = (path, options) => {
  const message = options?.host
    ? `🌯 Wrapito: ${options.host}${path} is called`
    : `🌯 Wrapito: ${path} is called`
  return {
    pass: true,
    message: () => message,
  }
}

export {
  emptyErrorMessage,
  fetchLengthErrorMessage,
  methodDoesNotMatchErrorMessage,
  bodyDoesNotMatchErrorMessage,
  doesNotHaveBodyErrorMessage,
  successMessage,
  haveBeenFetchedSuccessMessage,
}
