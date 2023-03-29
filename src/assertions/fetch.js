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

const findRequestsByPath = (expectedPath, options) =>
  fetch.mock.calls.filter(([call]) => {
    const url = getUrl(call)
    const defaultHost = getDefaultHost()
    const callURL = new URL(url, defaultHost)
    const path = getPath(options?.host, expectedPath, defaultHost)
    const expectedHost = options?.host || defaultHost
    const expectedURL = new URL(path, expectedHost)
    const matchPathName = callURL.pathname === expectedURL.pathname
    const matchSearchParams = callURL.search === expectedURL.search

    const matchHost = callURL.host === expectedURL.host
    if (expectedURL.search) {
      return matchPathName && matchSearchParams
    }
    if (options?.host) {
      return matchPathName && matchHost
    }
    return matchPathName
  })

const getDefaultHost = () => {
  const configuredHost = getConfig().defaultHost
  return configuredHost?.includes('http') ? configuredHost : 'https://default.com'
}

const getPath = (host = '', expectedPath, defaultHost) =>
  expectedPath.includes(defaultHost) ? expectedPath : host + expectedPath

const getUrl = call => (call instanceof Request ? call.url : call)
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
  if (!expectedBody) return doesNotHaveBodyErrorMessage()

  if (bodyDoesNotMatch(expectedBody, receivedRequestsBodies)) {
    return bodyDoesNotMatchErrorMessage(expectedBody, receivedRequestsBodies)
  }

  return successMessage()
}

const toHaveBeenFetched = (path, options) => {
  const requests = findRequestsByPath(path, options)
  return !requests.length
    ? emptyErrorMessage(path, options)
    : haveBeenFetchedSuccessMessage(path, options)
}

const toHaveBeenFetchedTimes = (path, expectedLength, options) => {
  const requests = findRequestsByPath(path, options)
  return requests.length !== expectedLength
    ? fetchLengthErrorMessage(path, expectedLength, requests.length)
    : successMessage()
}

export { toHaveBeenFetchedWith, toHaveBeenFetched, toHaveBeenFetchedTimes }
