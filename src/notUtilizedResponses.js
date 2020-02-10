import { greenBright, yellow, black } from 'chalk'

let mockedResponses = []
const saveListOfResponses = listOfResponses => mockedResponses = [ ...listOfResponses ]

let utilizedResponses = []
const addResponseAsUtilized = utilizedResponse => utilizedResponses = [ ...utilizedResponses, utilizedResponse ]

const getNotUtilizedResponses = () => {
  const notUtilizedResponses = mockedResponses.filter(response => {
    const hasNotUtilzedResponses = !utilizedResponses.includes(response)
    const multiplResponseNotFullyReturned = response.multipleResponses && response.multipleResponses.some(multipleResponseIsNotUsed)
    return hasNotUtilzedResponses || multiplResponseNotFullyReturned
  })

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

  return `RESPONSE BODY: ${ greenBright(responseBody) }`
}

const multipleResponseIsNotUsed = response => !response.hasBeenReturned

export { saveListOfResponses, addResponseAsUtilized, getNotUtilizedResponses }