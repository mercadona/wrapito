import React from 'react'
import { mount as _mount } from 'enzyme'
import { Provider } from 'react-redux'

import { mockStore } from './mockStore'
import { MockRouter } from './mockRouter'
import { mockFetch } from './mockFetch'

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

const asyncMount = Component => {
  const componentMounted = _mount(Component)

  componentMounted.asyncFind = selector => {
    return new Promise(resolve => {
      setImmediate(() => {
        componentMounted.update()

        resolve(componentMounted.find(selector))
      })
    })
  }

  return componentMounted
}

const mount = ({ Component, props }) => asyncMount(<Component { ...props } />)

const mountWithRouter = ({ Component, props: componentProps, routing }) => asyncMount(
  <MockRouter { ...{ Component, routing, componentProps } } />
)

const mountWithStore = ({ Component, props, store }) => asyncMount(
  <Provider store={ mockStore(store) }>
    <Component { ...props } />
  </Provider>
)

const mountWithStoreAndRouter = ({ Component, props: componentProps, store, routing }) => asyncMount(
  <Provider store={ mockStore(store) }>
    <MockRouter { ...{ Component, routing, componentProps } } />
  </Provider>
)

export { wrap }