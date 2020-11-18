import React from 'react'

import { mockFetch } from './mockFetch'
import { mockNetwork } from './mockNetwork'
import { getConfig } from './config'

const extendWith = (extensions, options) => {
  if (!extensions) return {}

  return Object.keys(extensions).reduce(
    (alreadyExtended, nextExtension) => ({
      ...alreadyExtended,
      [nextExtension]: (...args) => {
        extensions[nextExtension](args)
        return wrap(options)
      },
    }),
    {},
  )
}

const wrap = options => {
  const isComponent = typeof options === 'function'
  const isWrappedComponent = typeof options.WrappedComponent === 'function'

  if (isComponent || isWrappedComponent) {
    return wrap({ Component: options })
  }

  const { extend, portal, history } = getConfig()
  const extensions = extendWith(extend, options)

  return {
    withProps: props => wrap({ ...options, props }),
    withPortalAt: portalRootId =>
      wrap({ ...options, portalRootId, hasPortal: true }),
    withMocks: responses => wrap({ ...options, responses, hasMocks: true }),
    withNetwork: responses => wrap({ ...options, responses, hasNetwork: true }),
    ...extensions,
    atPath: path => wrap({ ...options, path, hasPath: true }),
    mount: () => {
      const {
        hasNetwork,
        hasMocks,
        responses,
        hasPortal,
        portalRootId,
        path,
        hasPath,
      } = options

      if (hasNetwork) {
        mockNetwork(responses)
      }

      if (hasMocks) {
        mockFetch(responses)
      }

      if (hasPortal) {
        setupPortal(portalRootId)
      }

      if (portal) {
        setupPortal(portal)
      }

      if (hasPath) {
        history.push(path)
      }

      return mount(options)
    },
  }
}

function setupPortal(portalRootId) {
  if (document.getElementById(portalRootId)) {
    return
  }

  const portalRoot = document.createElement('div')
  portalRoot.setAttribute('id', portalRootId)
  document.body.appendChild(portalRoot)
}

const mount = ({ Component, props }) =>
  getConfig().mount(<Component { ...props } />)

export { wrap }
