import React from 'react'

import { mockNetwork } from './mockNetwork'
import { getConfig } from './config'
import { updateOptions, getOptions } from './options'
import {
  Response,
  Wrap,
  WrapExtensionAPI,
  Extension,
  Extensions,
} from './models'

beforeEach(() => {
  global.fetch = jest.fn()
})

afterEach(() => {
  const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>
  mockedFetch.mockRestore()
})

const wrap = (Component: typeof React.Component): Wrap => {
  updateOptions({
    Component: Component,
    responses: [],
    props: {},
    path: '',
    hasPath: false,
    debug: process.env.npm_config_debugRequests === 'true',
  })

  return wrapWith()
}

const wrapWith = (): Wrap => {
  const extensions = extendWith()

  return {
    withProps,
    withNetwork,
    atPath,
    debugRequests,
    mount: getMount,
    ...extensions,
  }
}

const addResponses = (newResponses: Response[]) => {
  const options = getOptions()
  const responses = [...options.responses, ...newResponses]

  updateOptions({ ...options, responses })
}

const applyExtension = (args: any[], extension: Extension) => {
  const wrapExtensionAPI: WrapExtensionAPI = { addResponses }

  extension(wrapExtensionAPI, args)

  return wrapWith()
}

const buildExtensions = (
  alreadyExtended: Extensions,
  extensionName: string,
): Extensions => {
  const { extend: extensions } = getConfig()
  const extension = extensions[extensionName]
  return {
    ...alreadyExtended,
    [extensionName]: (...args: any) => applyExtension(args, extension),
  }
}

const extendWith = () => {
  const { extend: extensions } = getConfig()
  const extensionNames = Object.keys(extensions)

  return extensionNames.reduce(buildExtensions, {})
}

const withProps = (props: object) => {
  const options = getOptions()
  updateOptions({ ...options, props })
  return wrapWith()
}

const withNetwork = (responses: Response[] = []) => {
  const options = getOptions()
  const listOfResponses = Array.isArray(responses) ? responses : [responses]

  updateOptions({
    ...options,
    responses: [...options.responses, ...listOfResponses],
  })

  return wrapWith()
}

const atPath = (path: string, state: object) => {
  const options = getOptions()
  updateOptions({ ...options, state, path, hasPath: true })
  return wrapWith()
}

const debugRequests = () => {
  const options = getOptions()
  updateOptions({ ...options, debug: true })
  return wrapWith()
}

const getMount = () => {
  const { portal, changeRoute, history, mount } = getConfig()
  const { Component, props, responses, path, hasPath, debug, state } = getOptions()

  if (portal) {
    setupPortal(portal)
  }

  if (hasPath && history) {
    console.warn(
      'wrapito WARNING: history is DEPRECATED. Pass a changeRoute function to the config instead.',
    )
    console.warn(
      'Read about changeRoute in: https://github.com/mercadona/wrapito#changeRoute',
    )
    history.push(path, state)
  }

  if (hasPath && !history) {
    changeRoute(path)
  }

  mockNetwork(responses, debug)

  return mount(<Component {...props} />)
}

const setupPortal = (portalRootId: string) => {
  if (document.getElementById(portalRootId)) {
    return
  }

  const portalRoot = document.createElement('div')
  portalRoot.setAttribute('id', portalRootId)
  document.body.appendChild(portalRoot)
}

export { wrap }
