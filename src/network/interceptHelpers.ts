import type { Response as WrapResponse, WrapRequest } from '../@types/models'
import { printRequest } from './printRequest'
import { getRequestMatcher } from './requestMatcher'
import { createDefaultHttpResponse, createHttpResponse } from './responses'

export const extractRequestBody = async (
  interceptedRequest: Request,
): Promise<string | undefined> => {
  const body = await interceptedRequest.text()
  return body || undefined
}

export const createWrapRequest = (
  interceptedRequest: Request,
  body: string | undefined,
): WrapRequest => ({
  url: interceptedRequest.url,
  method: interceptedRequest.method,
  _bodyInit: body,
})

export const createRecordedRequest = (
  interceptedRequest: Request,
  body: string | undefined,
) => {
  const recordedRequest = new Request(interceptedRequest.url, {
    method: interceptedRequest.method,
    headers: interceptedRequest.headers,
    body,
  })

  if (body) {
    // Preserve the same private field our matchers inspect for request bodies
    ;(recordedRequest as any)._bodyInit = body
  }

  return recordedRequest
}

export const findMatchingResponse = (
  mockedResponses: WrapResponse[],
  wrapRequest: WrapRequest,
) => mockedResponses.find(getRequestMatcher(wrapRequest))

export const buildHttpResponse = (
  matchingResponse: WrapResponse | undefined,
  wrapRequest: WrapRequest,
  debug: boolean,
) => {
  if (!matchingResponse) {
    if (debug) {
      printRequest(wrapRequest)
    }
    return createDefaultHttpResponse()
  }

  const { multipleResponses } = matchingResponse
  if (!multipleResponses) {
    return createHttpResponse(matchingResponse)
  }

  const responseNotYetReturned = multipleResponses.find(
    response => !response.hasBeenReturned,
  )

  if (!responseNotYetReturned) {
    if (debug) {
      printRequest(wrapRequest)
    }
    return createDefaultHttpResponse()
  }

  responseNotYetReturned.hasBeenReturned = true
  return createHttpResponse(responseNotYetReturned)
}
