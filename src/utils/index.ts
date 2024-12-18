import deepEqual from 'deep-equal'
import { getConfig } from '../config'
import { RequestOptions, WrapRequest } from '../models'

import { MockInstance } from 'vitest'

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
  const typedFetch = fetch as MockInstance
  return typedFetch.mock.calls.filter(([call]) => {
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

export const empty = <T extends Array<unknown>>(requests: T) =>
  requests.length === 0
