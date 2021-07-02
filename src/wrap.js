import React from 'react'

import { mockNetwork } from './mockNetwork'
import { getConfig } from './config'

beforeEach(() => {
  global.fetch = jest.fn()
})

afterEach(() => {
  global.fetch.mockRestore()
})

const wrap = Component => {
  const options = {
    Component,
    responses: [],
    props: {},
    path: '',
    hasPath: false,
    debug: false,
  }

  return getWrap(options)
}

const getWrap = options => {
  const { extend, portal, history, mount } = getConfig()
  const extensions = extendWith(extend, options)

  return {
    withProps: getWithProps(options),
    withNetwork: getWithNetwork(options),
    atPath: getAtPath(options),
    debugRequests: getDebugRequest(options),
    mount: getMount(options, portal, history, mount),
    ...extensions,
  }
}

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
        return getWrap(options)
      },
    }),
    {},
  )
}

const getWithProps = options => props => {
  return getWrap({ ...options, props })
}

const getWithNetwork =
  options =>
  (responses = []) => {
    const listOfResponses = Array.isArray(responses) ? responses : [responses]

    return getWrap({
      ...options,
      responses: [...options.responses, ...listOfResponses],
    })
  }

const getAtPath = options => path => {
  return getWrap({ ...options, path, hasPath: true })
}

const getDebugRequest = options => () => {
  return getWrap({ ...options, debug: true })
}

const getMount = (options, portal, history, mount) => () => {
  const { Component, props, responses, path, hasPath, debug } = options

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

  return mount(<Component {...props} />)
}

const setupPortal = portalRootId => {
  if (document.getElementById(portalRootId)) {
    return
  }

  const portalRoot = document.createElement('div')
  portalRoot.setAttribute('id', portalRootId)
  document.body.appendChild(portalRoot)
}

export { wrap }
