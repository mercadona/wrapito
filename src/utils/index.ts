import deepEqual from 'deep-equal'
import { getConfig } from '../config'
import { RequestOptions, WrapRequest } from '../models'
import { getRequestLog } from './requestLog'

import type { MockInstance } from 'vitest'

const getDefaultHost = () => {
  const configuredHost = getConfig().defaultHost
  return configuredHost?.includes('http')
    ? configuredHost
    : 'https://default.com'
}

const getPath = (host = '', expectedPath: string, defaultHost: string) =>
  expectedPath.includes(defaultHost) ? expectedPath : host + expectedPath

const isRequest = (maybeRequest: unknown): maybeRequest is Request =>
  maybeRequest instanceof Request

const getUrl = (call: string | Request) => (isRequest(call) ? call.url : call)

export const findRequestsByPath = (
  expectedPath: string,
  options: RequestOptions = { method: 'GET' },
) => {
  const typedFetch = fetch as Partial<MockInstance>
  const mockCalls = typedFetch.mock?.calls ?? getRequestLog()
  if (!mockCalls) return []

  return mockCalls.filter(([call]) => {
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
}

export const getRequestsMethods = (requests: Array<Array<unknown>>) =>
  requests
    .flat(1)
    .filter(isRequest)
    .map(request => request.method)

export const getRequestsBodies = (requests: Array<Array<unknown>>) =>
  requests
    .flat(1)
    .filter(isRequest)
    .map((request: WrapRequest) => {
      if (!request._bodyInit) return {}

      return JSON.parse(request._bodyInit)
    })

export const getRequestsHosts = (requests: Array<Array<unknown>>) =>
  requests
    .flat(1)
    .filter(isRequest)
    .map(request => new URL(request.url, getDefaultHost()).hostname)

export const getRequestHeaders = (requests: Array<Array<unknown>>) =>
  requests
    .flat(1)
    .filter(isRequest)
    .map(request => {
      const headersObj: Record<string, string> = {}
      request.headers.forEach((value, key) => {
        headersObj[key] = value
      })
      return headersObj
    })

export const methodDoesNotMatch = (
  expectedMethod: string | undefined,
  receivedRequestsMethods: Array<string | undefined>,
) => expectedMethod && !receivedRequestsMethods.includes(expectedMethod)

export const bodyDoesNotMatch = (
  expectedBody: string | object,
  receivedRequestsBodies: Array<object>,
) => {
  const anyRequestMatch = receivedRequestsBodies
    .map(request => deepEqual(expectedBody, request))
    .every(requestCompare => requestCompare === false)

  return anyRequestMatch
}

export const hostDoesNotMatch = (
  expectedHost: string,
  receivedRequestsHosts: Array<string>,
) => {
  const anyRequestMatch = receivedRequestsHosts.every(
    requestHost => requestHost !== expectedHost,
  )

  return anyRequestMatch
}

export const headersDoNotMatch = (
  expectedHeaders: Record<string, string>,
  receivedRequestsHeaders: Array<Record<string, string>>,
) => {
  const anyRequestMatch = receivedRequestsHeaders.every(receivedHeaders => {
    return Object.entries(expectedHeaders).some(
      ([key, value]) => receivedHeaders[key.toLowerCase()] !== value,
    )
  })

  return anyRequestMatch
}

export const empty = <T extends Array<unknown>>(requests: T) =>
  requests.length === 0
