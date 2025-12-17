import { RequestOptions } from '../@types/models'
import {
  bodyDoesNotMatchErrorMessage,
  doesNotHaveBodyErrorMessage,
  emptyErrorMessage,
  fetchLengthErrorMessage,
  haveBeenFetchedSuccessMessage,
  headersDoNotMatchErrorMessage,
  hostDoesNotMatchErrorMessage,
  methodDoesNotMatchErrorMessage,
  successMessage,
} from './messages'

import {
  bodyDoesNotMatch,
  empty,
  findRequestsByPath,
  getRequestHeaders,
  getRequestsBodies,
  getRequestsHosts,
  getRequestsMethods,
  headersDoNotMatch,
  hostDoesNotMatch,
  methodDoesNotMatch,
} from '../network/utils'

const toHaveBeenFetchedWith = (
  path: string,
  options: RequestOptions = { method: 'GET' },
) => {
  const normalizedOptions = options || { method: 'GET' }
  const targetRequests = findRequestsByPath(path, normalizedOptions)

  if (empty(targetRequests)) {
    return emptyErrorMessage(path)
  }

  const receivedRequestsMethods = getRequestsMethods(targetRequests)
  const expectedMethod = normalizedOptions.method

  if (methodDoesNotMatch(expectedMethod, receivedRequestsMethods)) {
    return methodDoesNotMatchErrorMessage(
      expectedMethod,
      receivedRequestsMethods,
    )
  }

  const receivedRequestsBodies = getRequestsBodies(targetRequests)
  const expectedBody = normalizedOptions.body

  if (!expectedBody) return doesNotHaveBodyErrorMessage()

  if (bodyDoesNotMatch(expectedBody, receivedRequestsBodies)) {
    return bodyDoesNotMatchErrorMessage(expectedBody, receivedRequestsBodies)
  }

  const receivedRequestsHosts = getRequestsHosts(targetRequests)
  const expectedHost = normalizedOptions.host

  if (expectedHost && hostDoesNotMatch(expectedHost, receivedRequestsHosts)) {
    return hostDoesNotMatchErrorMessage(expectedHost, receivedRequestsHosts)
  }

  const receivedRequestsHeaders = getRequestHeaders(targetRequests)
  const expectedHeaders = normalizedOptions.headers

  if (
    expectedHeaders &&
    headersDoNotMatch(expectedHeaders, receivedRequestsHeaders)
  ) {
    return headersDoNotMatchErrorMessage(expectedHeaders, receivedRequestsHeaders)
  }

  return successMessage()
}

const toHaveBeenFetched = (
  path: string,
  options: RequestOptions = { method: 'GET' },
) => {
  const requests = findRequestsByPath(path, options)
  return !requests.length
    ? emptyErrorMessage(path, options)
    : haveBeenFetchedSuccessMessage(path, options)
}

const toHaveBeenFetchedTimes = (
  path: string,
  expectedLength: number = 1,
  options: RequestOptions = { method: 'GET' },
) => {
  const normalizedOptions = options || { method: 'GET' }
  const requests = findRequestsByPath(path, normalizedOptions)
  return requests.length !== expectedLength
    ? fetchLengthErrorMessage(path, expectedLength, requests.length)
    : successMessage()
}

const matchers = {
  toHaveBeenFetched,
  toHaveBeenFetchedWith,
  toHaveBeenFetchedTimes,
}

export { matchers, matchers as assertions }
