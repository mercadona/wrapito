import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

import { getMocksConfig } from './config'

function mockStore(inistialState = {}, reducers = getMocksConfig().reducers) {
  if (!reducers) {
    throw new Error([
      'reducers needs to be specified',
      'it can be set by doing configureMocks({ defaultStore, reducers })',
    ])
  }

  return createStore(
    reducers,
    { ...getMocksConfig().defaultStore, ...inistialState },
    applyMiddleware(thunk)
  )
}

export { mockStore }