import deepEqual from 'deep-equal'
import prettyFormat from 'pretty-format'
import { red } from 'chalk'

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
      return createMissingMockedResponseMatcher(requestsMissingResponse)
    }

    return createResponsesNotBeingUsedMatcher(mockedResponses)
  },
}

const createResponsesNotBeingUsedMatcher = mockedResponses => {
  const getResponseBeingUsedChecker = mockedResponse =>
    utilizedResponse =>
      !deepEqual(mockedResponse, utilizedResponse)
  const getResponsesNotBeingUsed = mockedResponse => getDeepUtilizedResponses()
    .every(getResponseBeingUsedChecker(mockedResponse))

  const responsesNotBeingUsed = formatMockedResponses(mockedResponses).filter(getResponsesNotBeingUsed).map(({ multipleResponses, ...restOfResponse }) => {
    const hasMultipleResponses = multipleResponses && multipleResponses.length > 0
    if (hasMultipleResponses) {
      return multipleResponses
        .filter(({ hasBeenReturned }) => !hasBeenReturned)
        .map((response) => response)
    }

    return restOfResponse
  })

  const pass = responsesNotBeingUsed.length === 0
  const message = () => {
    if (pass) { return }

    return createErrorMessage(ERRORS.NOT_BEING_USED, responsesNotBeingUsed)
  }

  return { message, pass }
}

const createMissingMockedResponseMatcher = requestsMissingResponse => {
  const message = () => createErrorMessage(ERRORS.MISSING_MOCKED_RESPONSE, requestsMissingResponse)

  return { message, pass: false }
}

const createErrorMessage = (error, responses) =>
  red(`Expected mocked responses to match the network requests but ${ error }\n\n${ prettyFormat(responses) }`)

const formatMockedResponses = mockedResponses => {
  if (!mockedResponses) { return [] }
  if (!mockedResponses.length) { return [ mockedResponses ] }
  return mockedResponses
}

export { assertions }