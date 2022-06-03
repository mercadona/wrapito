import deepEqual from 'deep-equal'
import { getConfig } from '../config'
import {
  emptyErrorMessage,
  fetchLengthErrorMessage,
  methodDoesNotMatchErrorMessage,
  bodyDoesNotMatchErrorMessage,
  doesNotHaveBodyErrorMessage,
  successMessage,
  haveBeenFetchedSuccessMessage,
} from './messages'

const findRequestsByPath = expectedPath =>
  fetch.mock.calls.filter(call => {
    const { defaultHost } = getConfig()
    const callURL = new URL(call[0].url, "https://default.com")
    const finalExpectedPath = expectedPath.includes(defaultHost) ? expectedPath : defaultHost + expectedPath
    const expectedURL = new URL(finalExpectedPath, "https://default.com")
    const matchPathName = callURL.pathname === expectedURL.pathname
    const matchSearchParams = callURL.search === expectedURL.search

    if (expectedURL.search) {
      return matchPathName && matchSearchParams
    }

    return matchPathName
  })

const getRequestsMethods = requests =>
  requests.map(request => request[0]?.method)

const getRequestsBodies = requests =>
  requests.map(request => {
    if (!request[0]._bodyInit) return {}

    return JSON.parse(request[0]._bodyInit)
  })

const methodDoesNotMatch = (expectedMethod, receivedRequestsMethods) =>
  expectedMethod && !receivedRequestsMethods.includes(expectedMethod)

const bodyDoesNotMatch = (expectedBody, receivedRequestsBodies) => {
  const anyRequestMatch = receivedRequestsBodies
    .map(request => deepEqual(expectedBody, request))
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
