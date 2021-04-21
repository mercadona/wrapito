import deepEqual from 'deep-equal'
import { green, red } from 'chalk'

const emptyErrorMessage = (path) => ({
  pass: false,
  message: () => `🌯 Burrito: ${path} ain't got called`,
})

const fetchLengthErrorMessage = (path, expectLength, currentLength) => ({
  pass: false,
  message: () => `🌯 Burrito: ${path} is called ${currentLength} times, you expected ${expectLength} times`,
})

const methodDoesNotMatchErrorMessage = (expected, received) => ({
  pass: false,
  message: () =>
    `🌯 Burrito: Fetch method does not match, expected ${expected} received ${received}`,
})

const bodyDoesNotMatchErrorMessage = (expected, received) => ({
  pass: false,
  message: () =>
    `🌯 Burrito: Fetch body does not match.
Expected:
${green(JSON.stringify(expected, null, ' '))}

Received:
${red(JSON.stringify(received, null, ' '))}`,
})

const successMessage = () => ({
  pass: true,
  message: () => undefined,
})

const findRequestsByPath = path =>
  fetch.mock.calls.filter(call => call[0].url.includes(path))

const getRequestsMethods = requests =>
  requests.map(request => request[0]?.method)

const getRequestsBodies = requests =>
  requests.map(request => {
    if (!request[0]._bodyInit) return {}

    return JSON.parse(request[0]._bodyInit)
  })

const methodDoesNotMatch = (expectedMethod, receivedRequestsMethods) =>
  expectedMethod && !receivedRequestsMethods.includes(expectedMethod)

const bodyDoesNotMatch = (expectedBody, receivedRequestsBodies) => {
  if (!expectedBody) return false

  const anyRequestMatch = receivedRequestsBodies
    .map(request => deepEqual(expectedBody, request))
    .every(requestCompare => requestCompare === false)

  return anyRequestMatch
}

const empty = requests => requests.length === 0

const toHaveBeenFetchedWith = (path, options) => {
  const targetRequests = findRequestsByPath(path)

  if (empty(targetRequests)) {
    return emptyErrorMessage(path)
  }

  const receivedRequestsMethods = getRequestsMethods(targetRequests)
  const expectedMethod = options?.method

  if (methodDoesNotMatch(expectedMethod, receivedRequestsMethods)) {
    return methodDoesNotMatchErrorMessage(expectedMethod, receivedRequestsMethods)
  }

  const receivedRequestsBodies = getRequestsBodies(targetRequests)
  const expectedBody = options?.body

  if (bodyDoesNotMatch(expectedBody, receivedRequestsBodies)) {
    return bodyDoesNotMatchErrorMessage(expectedBody, receivedRequestsBodies)
  }

  return successMessage()
}

const toHaveBeenFetched = (path) => {
  const requests = findRequestsByPath(path)
  return !requests.length ? emptyErrorMessage(path) : successMessage()
}

const toHaveBeenFetchedTimes = (path, expectedLength) => {
  const requests = findRequestsByPath(path)
  return requests.length !== expectedLength
    ? fetchLengthErrorMessage(path, expectedLength, requests.length)
    : successMessage()
}

export { toHaveBeenFetchedWith, toHaveBeenFetched, toHaveBeenFetchedTimes }
