import { toMatchNetworkRequests } from './toMatchNetworkRequests'
import { toHaveBeenFetchedWith, toHaveBeenFetched } from './fetch'

const assertions = {
  toMatchNetworkRequests,
  toHaveBeenFetchedWith,
  toHaveBeenFetched,
}

export { assertions }
