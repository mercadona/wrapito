import hash from 'object-hash'

import { getConfig } from './config'
import type { WrapRequest, Response } from './models'

const getComparableUrl = (rawUrl: string, base: string, catchParams?: boolean) => {
  const url = new URL(rawUrl, base)
  const shouldConsiderQuery = !getConfig().handleQueryParams || catchParams
  if (!shouldConsiderQuery) return url.pathname
  return url.pathname + url.search
}

const getRequestMatcher =
  (request: WrapRequest) => (mockedRequest: Response) => {
    const {
      method = 'GET',
      path,
      host,
      requestBody = undefined,
      catchParams,
    } = mockedRequest

    const defaultHost = getConfig().defaultHost || 'http://localhost'
    const base = host?.startsWith('http') ? host : defaultHost

    const mockedUrl = getComparableUrl(path, base, catchParams)
    const requestUrl = getComparableUrl(request.url, defaultHost, catchParams)

    const mockedRequestHash = hash({
      url: mockedUrl,
      method: method.toUpperCase(),
      requestBody: requestBody,
    })

    let body: unknown = undefined
    if ('_bodyInit' in request && request._bodyInit !== undefined) {
      body = JSON.parse(request._bodyInit)
    }
    const requestHash = hash({
      url: requestUrl,
      method: request.method,
      requestBody: body,
    })
    return requestHash === mockedRequestHash
  }

export { getRequestMatcher }
