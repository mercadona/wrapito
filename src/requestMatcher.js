import deepEqual from 'deep-equal'

import { getConfig } from './config'

const matchesRequestMethod = (request, method) => request.method.toLowerCase() === method
const matchesRequestUrl = (request, url, catchParams) => {
  const handleQueryParams = getConfig().handleQueryParams
  if (!handleQueryParams || catchParams) return request.url === url

  const requestUrlWithoutQueryParams = request.url.split('?')[0]
  const urlWithoutQueryParams = url.split('?')[0]
  return requestUrlWithoutQueryParams === urlWithoutQueryParams
}
const matchesRequestBody = (normalizedRequestBody, requestBody) => {
  return deepEqual(normalizedRequestBody, requestBody)
}

const getRequestMatcher = (request, normalizedRequestBody) => ({
  method = 'get',
  path,
  host = getConfig().defaultHost,
  requestBody = null,
  catchParams,
}) => {
  const url = host + path

  return (
    matchesRequestMethod(request, method) &&
    matchesRequestUrl(request, url, catchParams) &&
    matchesRequestBody(normalizedRequestBody, requestBody)
  )
}

export { getRequestMatcher }
