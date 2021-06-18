import React from 'react'

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
      const { responses, path, hasPath, debug } = options

      if (portal) {
        setupPortal(portal)
      }

      if (hasPath && history) {
        history.push(path)
      }

      if (hasPath && !history) {
        window.history.replaceState(null, null, path)
      }

      mockNetwork(responses, debug)
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
