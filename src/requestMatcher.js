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

  const mockedRequestHash = hash({
    url: isQueryParamsSensitive ? url : url.split('?')[0],
    method: method.toUpperCase(),
    requestBody: requestBody,
  })

  if (typeof request === 'string') {
    const requestHash = hash({
      url: isQueryParamsSensitive ? request : request.split('?')[0],
      method: 'GET',
      requestBody: undefined,
    })
    return requestHash === mockedRequestHash
  }

  const hasBody = !!request._bodyInit
  const requestHash = hash({
    url: isQueryParamsSensitive ? request.url : request.url.split('?')[0],
    method: request.method,
    requestBody: hasBody ? JSON.parse(request._bodyInit) : undefined,
  })
  return requestHash === mockedRequestHash
}

export { getRequestMatcher }
