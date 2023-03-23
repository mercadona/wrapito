import { green, red } from 'chalk'

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
    `🌯 Wrapito: Fetch method does not match, expected ${expected} received ${received}`,
})

const bodyDoesNotMatchErrorMessage = (expected, received) => ({
  pass: false,
  message: () =>
    `🌯 Wrapito: Fetch body does not match.
Expected:
${green(JSON.stringify(expected, null, ' '))}

Received:
${red(JSON.stringify(received, null, ' '))}`,
})

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
    ? `🌯 Wrapito: ${path} is called with host ${options.host}`
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
