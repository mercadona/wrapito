import React from 'react'

import { mockNetwork } from './mockNetwork'
import { getConfig, Mount } from './config'
import { options, updateOptions } from './options'
import {
  BrowserHistory,
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
  const { extend, portal, changeRoute, history, mount } = getConfig()
  const extensions = extendWith(extend)

  return {
    withProps: getWithProps(),
    withNetwork: getWithNetwork(),
    atPath: getAtPath(),
    debugRequests: getDebugRequest(),
    mount: getMount(mount, changeRoute, history, portal),
    ...extensions,
  }
}

const addResponses = () => (responses: Response[]) => {
  options.responses = [...options.responses, ...responses]
}

const applyExtension = (
  args: any[],
  extension: Extension,
) => {
  const wrapExtensionAPI: WrapExtensionAPI = {
    addResponses: addResponses(),
  }
  extension(wrapExtensionAPI, args)
  return wrapWith()
}

const buildExtensions =
  (extensions: Extensions) =>
  (alreadyExtended: Extensions, extensionName: string): Extensions => {
    const extension = extensions[extensionName]
    return {
      ...alreadyExtended,
      [extensionName]: (...args: any) =>
        applyExtension(args, extension),
    }
  }

const extendWith = (extensions: Extensions) => {
  if (!extensions) return {}

  const extensionNames = Object.keys(extensions)
  return extensionNames.reduce(buildExtensions(extensions), {})
}

const getWithProps = () => (props: object) => {
  updateOptions({ ...options, props })
  return wrapWith()
}

const getWithNetwork =
  () =>
  (responses: Response[] = []) => {
    const listOfResponses = Array.isArray(responses) ? responses : [responses]

    updateOptions({
      ...options,
      responses: [...options.responses, ...listOfResponses],
    })

    return wrapWith()
  }

const getAtPath = () => (path: string) => {
  updateOptions({ ...options, path, hasPath: true })
  return wrapWith()
}

const getDebugRequest = () => () => {
  updateOptions({ ...options, debug: true })

  return wrapWith()
}

const getMount =
  (
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
