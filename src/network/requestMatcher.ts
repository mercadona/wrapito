import hash from 'object-hash'

import { getConfig } from '../config'
import type { Response, WrapRequest } from '../@types/models'

const getRequestMatcher =
  (request: WrapRequest) => (mockedRequest: Response) => {
    const {
      method = 'GET',
      path,
      host = getConfig().defaultHost,
      requestBody = undefined,
      catchParams,
    } = mockedRequest

    const url = 'http://' + host + path
    const isQueryParamsSensitive = !getConfig().handleQueryParams || catchParams

    const mockedRequestHash = hash({
      url: isQueryParamsSensitive ? url : url.split('?')[0],
      method: method.toUpperCase(),
      requestBody: requestBody,
    })

    let body: unknown = undefined
    if ('_bodyInit' in request && request._bodyInit !== undefined) {
      body = JSON.parse(request._bodyInit)
    }
    const requestHash = hash({
      url: isQueryParamsSensitive ? request.url : request.url.split('?')[0],
      method: request.method,
      requestBody: body,
    })

    return requestHash === mockedRequestHash
  }

export { getRequestMatcher }
