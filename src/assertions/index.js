import { toMatchNetworkRequests } from './toMatchNetworkRequests'
import { toHaveBeenFetchedWith, toHaveBeenFetched, toHaveBeenFetchedTimes } from './fetch'

const assertions = {
  toMatchNetworkRequests,
  toHaveBeenFetchedWith,
  toHaveBeenFetched,
  toHaveBeenFetchedTimes,
}

export { assertions }
