import React from 'react'
import { Provider } from 'react-redux'

import { mockStore } from './mockStore'
import { MockRouter } from './mockRouter'
import { mockFetch } from './mockFetch'
import { getMocksConfig } from './config'

const wrap = options => {
  const isComponent = typeof options === 'function'

  if (isComponent) {
    return wrap({ Component: options })
  }

  return {
    withProps: props => wrap({ ...options, props }),
    withPortalAt: portalRootId => wrap({ ...options, portalRootId, hasPortal: true }),
    withRouter: routing => wrap({ ...options, routing, hasRouter: true }),
    withStore: store => wrap({ ...options, store, hasStore: true }),
    withMocks: responses => wrap({ ...options, responses, hasMocks: true }),
    mount: () => {
      const { hasMocks, responses, hasRouter, hasStore, hasPortal, portalRootId } = options

      if (hasMocks) {
        mockFetch(responses)
      }

      if (hasPortal) {
        setupPortal(portalRootId)
      }

      if (hasRouter && hasStore) {
        return mountWithStoreAndRouter(options)
      }

      if (hasStore) {
        return mountWithStore(options)
      }

      if (hasRouter) {
        return mountWithRouter(options)
      }

      return mount(options)
    },
  }
}

function setupPortal(portalRootId) {
  const portalRoot = document.createElement('div')
  portalRoot.setAttribute('id', portalRootId)
  document.body.appendChild(portalRoot)
}

const mount = ({ Component, props }) => getMocksConfig().mount(<Component { ...props } />)

const mountWithRouter = ({ Component, props: componentProps, routing }) => getMocksConfig().mount(
  <MockRouter { ...{ Component, routing, componentProps } } />
)

const mountWithStore = ({ Component, props, store }) => getMocksConfig().mount(
  <Provider store={ mockStore(store) }>
    <Component { ...props } />
  </Provider>
)

const mountWithStoreAndRouter = ({ Component, props: componentProps, store, routing }) => getMocksConfig().mount(
  <Provider store={ mockStore(store) }>
    <MockRouter { ...{ Component, routing, componentProps } } />
  </Provider>
)

export { wrap }