import diff from 'jest-diff'

import { getDeepUtilizedResponses, getRequestsMissingResponse } from './notUtilizedResponses'

const assertions = {
  toMatchNetworkRequests (mockedResponses) {
    const requestsMissingResponse = getRequestsMissingResponse()
    const thereAreRequestsMissingResponse = requestsMissingResponse.length > 0

    if (thereAreRequestsMissingResponse) {
      return createJestMatcher(
        [],
        requestsMissingResponse,
        'Expected mocked responses to match the network requests but there are requests missing a mocked response:'
      )
    }

    const deepUtilizedResponses = getDeepUtilizedResponses()
    return createJestMatcher(
      deepUtilizedResponses,
      mockedResponses,
      'Expected mocked responses to match the network requests but found mocked responses not being used:'
    )
  },
}

const createJestMatcher = (expected, received, errorMessage) => {
  const responsesDiff = diff(expected, received)
  const pass = responsesDiff.includes('Compared values have no visual difference.')
  const message = () => {
    if (pass) { return }

    return errorMessage +
    '\n\n' +
    responsesDiff
  }

  return { message, pass }
}

export { assertions }