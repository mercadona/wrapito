import diff from 'jest-diff'

import { getDeepUtilizedResponses } from './notUtilizedResponses'

const assertions = {
  toMatchNetworkRequests (mockedResponses) {
    const deepUtilizedResponses = getDeepUtilizedResponses()

    const responsesDiff = diff(deepUtilizedResponses, mockedResponses)
    const pass = responsesDiff.includes('Compared values have no visual difference.')
    const message = () => {
      if (pass) { return }

      return 'Expected to match the network requests but found mocked responses not being used:' +
      '\n\n' +
      responsesDiff
    }

    return { message, pass }
  },
}

export { assertions }