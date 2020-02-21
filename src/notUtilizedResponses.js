import { greenBright, yellow, black } from 'chalk'

let mockedResponses = []
const saveListOfResponses = listOfResponses => mockedResponses = [ ...listOfResponses ]

let utilizedResponses = new Set([])
const addResponseAsUtilized = utilizedResponse => utilizedResponses.add(utilizedResponse)
const resetUtilizedResponses = () => utilizedResponses = new Set([])
const getDeepUtilizedResponses = () => {
  return [ ...utilizedResponses ].map(response => {
    if (response.multipleResponses) {
      return {
        ...response,
        multipleResponses: response.multipleResponses.filter(({ hasBeenReturned }) => hasBeenReturned)
      }
    }

    return response
  })
}

let requestsMissingResponse = []
const addRequestMissingResponse = request => requestsMissingResponse = [ ...requestsMissingResponse, request ]
const getRequestsMissingResponse = () => [ ...requestsMissingResponse ]
const resetRequestsMissingResponse = () => requestsMissingResponse = []

const highlightNotUtilizedResponses = () => {
  const notUtilizedResponses = mockedResponses.filter(getNotUtilizedResponses)

  const allResponsesAreBeingUtilized = notUtilizedResponses.length === 0

  if (allResponsesAreBeingUtilized) return

  console.warn(`
${ black.bold.bgYellow('burrito') } ${ yellow.bold('the following responses are not being used:') }
${ notUtilizedResponses.map(({ path, method = 'get', responseBody, multipleResponses }) => `
  PATH: ${ greenBright(path) }
  METHOD: ${ greenBright(method.toLowerCase()) }
  ${ getProperResponseBody(responseBody, multipleResponses) }
`)}
`)
}

const getProperResponseBody = (responseBody, multipleResponses) => {
  const hasMultipleResponses = multipleResponses && multipleResponses.length > 0
  if (hasMultipleResponses) {
return `MULTIPLE RESPONSES:
  ${ multipleResponses
      .filter(multipleResponseIsNotUsed)
      .map(response => greenBright(JSON.stringify(response.responseBody))).join(`
  `) }
`
  }

  return `RESPONSE BODY: ${ greenBright(JSON.stringify(responseBody)) }`
}

const multipleResponseIsNotUsed = response => !response.hasBeenReturned

const getNotUtilizedResponses = response => {
  const hasNotUtilzedResponses = ![ ...utilizedResponses ].includes(response)
  const multiplResponseNotFullyReturned = response.multipleResponses &&
    response.multipleResponses.some(multipleResponseIsNotUsed)

  return hasNotUtilzedResponses || multiplResponseNotFullyReturned
}

export {
  saveListOfResponses,
  addResponseAsUtilized,
  highlightNotUtilizedResponses,
  getDeepUtilizedResponses,
  resetUtilizedResponses,
  addRequestMissingResponse,
  getRequestsMissingResponse,
  resetRequestsMissingResponse,
}