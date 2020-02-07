import { white, redBright, greenBright } from 'chalk'

let mockedResponses = []
const saveListOfResponses = listOfResponses => mockedResponses = [ ...listOfResponses ]

let utilizedResponses = []
const addResponseAsUtilized = utilizedResponse => utilizedResponses = [ ...utilizedResponses, utilizedResponse ]

const getNotUtilizedResponses = () => {
  const notUtilizedResponses = mockedResponses.filter(response => !utilizedResponses.includes(response))
  const allResponsesAreBeingUtilized = notUtilizedResponses.length === 0

  if (allResponsesAreBeingUtilized) return

  console.warn(`
    ${ white.bold.bgRed('burrito') } ${ redBright.bold('the following responses are not being used:') }
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
      ${ multipleResponses.map(response => greenBright(JSON.stringify(response.responseBody))).join(`
      `) }
    `
  }

  return `RESPONSE BODY: ${ greenBright(responseBody) }`
}

export { saveListOfResponses, addResponseAsUtilized, getNotUtilizedResponses }