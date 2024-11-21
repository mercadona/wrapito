import { RequestOptions } from '../models'
import { diff } from 'jest-diff'

type Body = string | object | undefined

const emptyErrorMessage = (path: string, options?: RequestOptions) => {
  const message = options?.host
    ? `🌯 Wrapito: ${options?.host}${path} ain't got called`
    : `🌯 Wrapito: ${path} ain't got called`

  return {
    pass: false,
    message: () => message,
  }
}

const fetchLengthErrorMessage = (
  path: string,
  expectLength: number,
  currentLength: number,
) => ({
  pass: false,
  message: () =>
    `🌯 Wrapito: ${path} is called ${currentLength} times, you expected ${expectLength} times`,
})

const methodDoesNotMatchErrorMessage = (
  expected: string | undefined,
  received: string | Array<string>,
) => ({
  pass: false,
  message: () =>
    `🌯 Wrapito: Fetch method does not match, expected ${expected} received ${
      received ?? 'none'
    }`,
})

const bodyDoesNotMatchErrorMessage = (
  expected: Body,
  receivedBodies: Array<Body>,
) => {
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
  message: () => 'Test passing',
})

const haveBeenFetchedSuccessMessage = (
  path: string,
  options: { host?: string },
) => {
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
