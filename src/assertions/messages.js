import { green, red } from 'chalk'

const emptyErrorMessage = path => ({
  pass: false,
  message: () => `🌯 Wrapito: ${ path } ain't got called`,
})

const fetchLengthErrorMessage = (path, expectLength, currentLength) => ({
  pass: false,
  message: () =>
    `🌯 Wrapito: ${ path } is called ${ currentLength } times, you expected ${ expectLength } times`,
})

const methodDoesNotMatchErrorMessage = (expected, received) => ({
  pass: false,
  message: () =>
    `🌯 Wrapito: Fetch method does not match, expected ${ expected } received ${ received }`,
})

const bodyDoesNotMatchErrorMessage = (expected, received) => ({
  pass: false,
  message: () =>
    `🌯 Wrapito: Fetch body does not match.
Expected:
${ green(JSON.stringify(expected, null, ' ')) }

Received:
${ red(JSON.stringify(received, null, ' ')) }`,
})

const doesNotHaveBodyErrorMessage = () => ({
  pass: false,
  message: () => '🌯 Wrapito: Unable to find body.'
})

const successMessage = () => ({
  pass: true,
  message: () => undefined,
})

export {
  emptyErrorMessage,
  fetchLengthErrorMessage,
  methodDoesNotMatchErrorMessage,
  bodyDoesNotMatchErrorMessage,
  doesNotHaveBodyErrorMessage,
  successMessage,
}
