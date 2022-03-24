import React from 'react'

import { mockNetwork } from './mockNetwork'
import { getConfig, Mount } from './config'
import {
  BrowserHistory,
  Response,
  Wrap,
  WrapOptions,
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
  const options = {
    Component,
    responses: [],
    props: {},
    path: '',
    hasPath: false,
    debug: false,
  }

  return wrapWith(options)
}

const wrapWith = (options: WrapOptions): Wrap => {
  const { extend, portal, changeRoute, history, mount } = getConfig()
  const extensions = extendWith(extend, options)

  return {
    withProps: getWithProps(options),
    withNetwork: getWithNetwork(options),
    atPath: getAtPath(options),
    debugRequests: getDebugRequest(options),
    mount: getMount(options, mount, changeRoute, history, portal),
    ...extensions,
  }
}

const addResponses = (options: WrapOptions) => (responses: Response[]) => {
  options.responses = [...options.responses, ...responses]
}

const applyExtension = (
  options: WrapOptions,
  args: any[],
  extension: Extension,
) => {
  const wrapExtensionAPI: WrapExtensionAPI = {
    addResponses: addResponses(options),
  }
  extension(wrapExtensionAPI, args)
  return wrapWith(options)
}

const buildExtensions =
  (extensions: Extensions, options: WrapOptions) =>
  (alreadyExtended: Extensions, extensionName: string): Extensions => {
    const extension = extensions[extensionName]
    return {
      ...alreadyExtended,
      [extensionName]: (...args: any) =>
        applyExtension(options, args, extension),
    }
  }

const extendWith = (extensions: Extensions, options: WrapOptions) => {
  if (!extensions) return {}

  const extensionNames = Object.keys(extensions)
  return extensionNames.reduce(buildExtensions(extensions, options), {})
}

const getWithProps = (options: WrapOptions) => (props: object) => {
  return wrapWith({ ...options, props })
}

const getWithNetwork =
  (options: WrapOptions) =>
  (responses: Response[] = []) => {
    const listOfResponses = Array.isArray(responses) ? responses : [responses]

    return wrapWith({
      ...options,
      responses: [...options.responses, ...listOfResponses],
    })
  }

const getAtPath = (options: WrapOptions) => (path: string) => {
  return wrapWith({ ...options, path, hasPath: true })
}

const getDebugRequest = (options: WrapOptions) => () => {
  return wrapWith({ ...options, debug: true })
}

const getMount =
  (
    options: WrapOptions,
    mount: Mount,
    changeRoute: (path: string) => void,
    history?: BrowserHistory,
    portal?: string,
  ) =>
  () => {
    const { Component, props, responses, path, hasPath, debug } = options

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
      history.push(path)
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
