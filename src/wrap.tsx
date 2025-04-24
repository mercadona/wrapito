import * as React from 'react'

import { mockNetwork } from './mockNetwork'
import { getConfig } from './config'
import { updateOptions, getOptions } from './options'
import type {
  Response,
  Wrap,
  WrapExtensionAPI,
  Extension,
  Extensions,
} from './models'
import { enhancedSpy } from './utils/tinyspyWrapper'
import { MockInstance } from './utils/types'

beforeEach(() => {
  // @ts-expect-error
  global.fetch = enhancedSpy()
})

afterEach(() => {
  // @ts-expect-error
  const mockedFetch = global.fetch as MockInstance
  mockedFetch.mockReset()
})

const wrap = (component: unknown): Wrap => {
  updateOptions({
    Component: component,
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

const withNetwork = (responses: Response | Response[] = []) => {
  const options = getOptions()
  const listOfResponses = Array.isArray(responses) ? responses : [responses]

  updateOptions({
    ...options,
    responses: [...options.responses, ...listOfResponses],
  })

  return wrapWith()
}

const atPath = (path: string, historyState?: object) => {
  const options = getOptions()
  updateOptions({ ...options, historyState, path, hasPath: true })
  return wrapWith()
}

const debugRequests = () => {
  const options = getOptions()
  updateOptions({ ...options, debug: true })
  return wrapWith()
}

const getMount = () => {
  const { portal, changeRoute, history, mount } = getConfig()
  const { Component, props, responses, path, hasPath, debug, historyState } =
    getOptions()

  const C = Component as React.JSXElementConstructor<unknown>

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
    history.push(path, historyState)
  }

  if (hasPath && !history) {
    changeRoute(path)
  }

  mockNetwork(responses, debug)

  return mount?.(<C {...props} />)
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
