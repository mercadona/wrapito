import React from 'react'
import { yellow } from 'chalk'

import { mockFetch } from './mockFetch'
import { mockNetwork } from './mockNetwork'
import { getConfig } from './config'

beforeEach(() => {
  global.fetch = jest.fn()
})

afterEach(() => {
  global.fetch.mockRestore()
})

const extendWith = (extensions, options) => {
  if (!extensions) return {}

  return Object.keys(extensions).reduce(
    (alreadyExtended, nextExtension) => ({
      ...alreadyExtended,
      [nextExtension]: (...args) => {
        extensions[nextExtension](
          {
            addResponses: (responses = []) => {
              const responsesToAdd = Array.isArray(responses)
                ? responses
                : [responses]
              options.responses = [...options.responses, ...responsesToAdd]
            },
          },
          args,
        )
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

  if (!options.responses) {
    return wrap({ ...options, responses: [] })
  }

  const { extend, portal, history } = getConfig()
  const extensions = extendWith(extend, options)

  return {
    withProps: props => wrap({ ...options, props }),
    withMocks: responses => {
      console.warn(yellow('withMocks is deprecated. Use withNetwork instead.'))
      return wrap({ ...options, responses, hasMocks: true })
    },
    withNetwork: (responses = []) => {
      const listOfResponses = Array.isArray(responses) ? responses : [responses]
      return wrap({
        ...options,
        responses: [...options.responses, ...listOfResponses],
      })
    },
    ...extensions,
    atPath: path => wrap({ ...options, path, hasPath: true }),
    debugRequests: () => wrap({ ...options, debug: true }),
    mount: () => {
      const { hasMocks, responses, path, hasPath } = options
      const {
        hasMocks,
        responses,
        path,
        hasPath,
        debug,
      } = options

      if (hasMocks) {
        mockFetch(responses)
      } else {
        mockNetwork(responses, debug)
      }

      if (portal) {
        setupPortal(portal)
      }

      if (hasPath && history) {
        history.push(path)
      }

      if (hasPath && !history) {
        window.history.replaceState(null, null, path)
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
