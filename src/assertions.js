import diff from 'jest-diff'

import { getDeepUtilizedResponses, getRequestsMissingResponse } from './notUtilizedResponses'

const ERRORS = {
  MISSING_MOCKED_RESPONSE: 'there are requests missing a mocked response:',
  NOT_BEING_USED: 'found mocked responses not being used:',
}

const assertions = {
  toMatchNetworkRequests (mockedResponses) {
    const requestsMissingResponse = getRequestsMissingResponse()
    const thereAreRequestsMissingResponse = requestsMissingResponse.length > 0

    if (thereAreRequestsMissingResponse) {
      return createJestMatcher([], requestsMissingResponse, ERRORS.MISSING_MOCKED_RESPONSE)
    }

    return createJestMatcher(getDeepUtilizedResponses(), formatMockedResponses(mockedResponses), ERRORS.NOT_BEING_USED)
  },
}

const createJestMatcher = (expected, received, errorMessage) => {
  const responsesDiff = diff(expected, received)
  const pass = responsesDiff.includes('Compared values have no visual difference.')
  const message = () => {
    if (pass) { return }

    return `Expected mocked responses to match the network requests but ${ errorMessage }\n\n${ responsesDiff }`
  }

  return { message, pass }
}

const formatMockedResponses = mockedResponses => {
  if (!mockedResponses) { return [] }
  if (!mockedResponses.length) { return [ mockedResponses ] }
  return mockedResponses
}

export { assertions }