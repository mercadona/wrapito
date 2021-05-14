import hash from 'object-hash'

import { getConfig } from './config'

const getRequestMatcher = request => mockedRequest => {
  const {
    method = 'GET',
    path,
    host = getConfig().defaultHost,
    requestBody = undefined,
    catchParams,
  } = mockedRequest

  const url = host + path
  const isQueryParamsSensitive = !getConfig().handleQueryParams || catchParams

  const hasBody = !!request._bodyInit
  const requestHash = hash({
    url: isQueryParamsSensitive ? request.url : request.url.split('?')[0],
    method: request.method,
    requestBody: hasBody ? JSON.parse(request._bodyInit) : undefined,
  })
  const mockedRequestHash = hash({
    url: isQueryParamsSensitive ? url : url.split('?')[0],
    method: method.toUpperCase(),
    requestBody: requestBody,
  })

  return requestHash === mockedRequestHash
}

export { getRequestMatcher }
