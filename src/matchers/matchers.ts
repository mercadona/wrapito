import { RequestOptions } from '../models'
import {
  emptyErrorMessage,
  fetchLengthErrorMessage,
  methodDoesNotMatchErrorMessage,
  bodyDoesNotMatchErrorMessage,
  doesNotHaveBodyErrorMessage,
  successMessage,
  haveBeenFetchedSuccessMessage,
} from './messages'

import {
  findRequestsByPath,
  empty,
  getRequestsMethods,
  getRequestsBodies,
  bodyDoesNotMatch,
  methodDoesNotMatch,
} from '../utils'

const toHaveBeenFetchedWith = (path: string, options?: RequestOptions) => {
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
  expectedLength: number,
  options: RequestOptions = { method: 'GET' },
) => {
  const requests = findRequestsByPath(path, options)
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
