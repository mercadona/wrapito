import { toMatchNetworkRequests } from './toMatchNetworkRequests'
import { toHaveBeenFetchedWith } from './globalFetchAssertions'

const assertions = {
  toMatchNetworkRequests,
  toHaveBeenFetchedWith,
}

export { assertions }
