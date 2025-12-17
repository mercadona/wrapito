import hash from 'object-hash'

import { getConfig } from './config'
import type { Response, WrapRequest } from './models'

const stripProtocol = (url: string) =>
  url.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '')

const normalizeBasePath = (base: string) => {
  if (!base) return ''

  const withoutQuery = base.split(/[?#]/)[0]
  const withoutProtocol = stripProtocol(withoutQuery)
  const normalized = withoutProtocol.startsWith('//')
    ? withoutProtocol.slice(2)
    : withoutProtocol

  if (normalized.startsWith('/')) return normalized

  const slashIndex = normalized.indexOf('/')
  if (slashIndex === -1) return ''
  return normalized.slice(slashIndex) || '/'
}

const resolvePathname = (path: string, basePath: string) => {
  if (!path) return basePath || '/'
  if (path.startsWith('/')) return path

  const slashIndex = path.indexOf('/')
  const hasSlash = slashIndex !== -1
  const firstSegment = hasSlash ? path.slice(0, slashIndex) : path
  const remaining = hasSlash ? path.slice(slashIndex) : ''

  const looksLikeHost =
    firstSegment === 'localhost' ||
    firstSegment.includes('.') ||
    firstSegment.includes(':')

  if (looksLikeHost) {
    return hasSlash ? remaining || '/' : '/'
  }

  if (basePath) {
    const normalizedBase = basePath.endsWith('/')
      ? basePath.slice(0, -1)
      : basePath
    return `${normalizedBase}/${path}`
  }

  return `/${path}`
}

const getComparableUrl = (rawUrl: string, base: string, catchParams?: boolean) => {
  const shouldConsiderQuery = !getConfig().handleQueryParams || catchParams
  const sanitizedUrl = rawUrl.split('#')[0]
  const [rawPath = '', rawQuery] = sanitizedUrl.split('?', 2)
  const search = shouldConsiderQuery && rawQuery ? `?${rawQuery}` : ''

  const withoutProtocol = stripProtocol(rawPath)
  const cleanedPath = withoutProtocol.startsWith('//')
    ? withoutProtocol.slice(2)
    : withoutProtocol

  const basePath = normalizeBasePath(base)
  const pathname = resolvePathname(cleanedPath, basePath)

  return shouldConsiderQuery ? `${pathname}${search}` : pathname
}

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
