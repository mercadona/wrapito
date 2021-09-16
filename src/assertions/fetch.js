import deepEqual from 'deep-equal'
import {
  emptyErrorMessage,
  fetchLengthErrorMessage,
  methodDoesNotMatchErrorMessage,
  bodyDoesNotMatchErrorMessage,
  doesNotHaveBodyErrorMessage,
  successMessage,
  haveBeenFetchedSuccessMessage,
} from './messages'

const findRequestsByPath = path =>
  fetch.mock.calls.filter(call => call[0].url.includes(path))

const getRequestsMethods = requests =>
  requests.map(request => request[0]?.method)

const getRequestsBodies = requests =>
  requests.map(request => {
    if (!request[0]._bodyInit) return {}

    return JSON.parse(request[0]._bodyInit)
  })

const getRequestsHeaders = (requests) => {
  return requests.map(request => request[0].headers)
}

const methodDoesNotMatch = (expectedMethod, receivedRequestsMethods) =>
  expectedMethod && !receivedRequestsMethods.includes(expectedMethod)

const bodyDoesNotMatch = (expectedBody, receivedRequestsBodies) => {
  const anyRequestMatch = receivedRequestsBodies
    .map(request => deepEqual(expectedBody, request))
    .every(requestCompare => requestCompare === false)

  return anyRequestMatch
}

const headersDoesNotMatch = (expectedHeaders, receivedRequestsHeaders) => {
  /* eslint-disable no-alert, no-console, no-debugger */
  console.log('expectedHeaders', expectedHeaders)
  console.log('receivedRequestsHeaders', receivedRequestsHeaders)
  const anyRequestMatch = receivedRequestsHeaders
    .map(request => deepEqual(expectedHeaders, request))
    .every(requestCompare => requestCompare === false)

  return anyRequestMatch
}

const empty = requests => requests.length === 0

const toHaveBeenFetchedWith = (path, options) => {
  const targetRequests = findRequestsByPath(path)

  if (empty(targetRequests)) {
    return emptyErrorMessage(path)
  }

  const receivedRequestsMethods = getRequestsMethods(targetRequests)
  const expectedMethod = options?.method

  if (methodDoesNotMatch(expectedMethod, receivedRequestsMethods)) {
    return methodDoesNotMatchErrorMessage(
      expectedMethod,
      receivedRequestsMethods,
    )
  }

  const receivedRequestsBodies = getRequestsBodies(targetRequests)
  const expectedBody = options?.body
  if(!expectedBody) return doesNotHaveBodyErrorMessage()

  if (bodyDoesNotMatch(expectedBody, receivedRequestsBodies)) {
    return bodyDoesNotMatchErrorMessage(expectedBody, receivedRequestsBodies)
  }

  const receivedRequestsHeaders = getRequestsHeaders(targetRequests)
  const expectedHeaders = options?.headers
  if (headersDoesNotMatch(expectedHeaders, receivedRequestsHeaders)) {
    // return { pass: false, message: () => '' }
  }
  return successMessage()
}

const toHaveBeenFetched = path => {
  const requests = findRequestsByPath(path)
  return !requests.length ? emptyErrorMessage(path) : haveBeenFetchedSuccessMessage(path)
}

const toHaveBeenFetchedTimes = (path, expectedLength) => {
  const requests = findRequestsByPath(path)
  return requests.length !== expectedLength
    ? fetchLengthErrorMessage(path, expectedLength, requests.length)
    : successMessage()
}

export { toHaveBeenFetchedWith, toHaveBeenFetched, toHaveBeenFetchedTimes }
