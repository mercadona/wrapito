import * as React from 'react'
import 'whatwg-fetch'

import { getConfig } from './config'
import { getOptions, updateOptions } from './options'
import type {
  Extension,
  Extensions,
  NetworkMocker,
  Response,
  Wrap,
  WrapExtensionAPI,
} from './models'
import { createMswNetworkMocker } from './mswExtension'
import { enhancedSpy } from './utils/tinyspyWrapper'
import { MockInstance } from './utils/types'

const ensureFetch = () => {
  if (typeof global.fetch === 'function') return global.fetch

  return (input?: RequestInfo, init?: RequestInit) =>
    Promise.resolve(new Response(null, { status: 200, headers: new Headers() }))
}

// @ts-expect-error
beforeEach(() => {
  // @ts-expect-error
  const baseFetch = ensureFetch()
  // @ts-expect-error
  global.fetch = enhancedSpy(baseFetch)
})

// @ts-expect-error
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
    interactionConfig: undefined,
    debug: process.env.npm_config_debugRequests === 'true',
    networkMocker: createMswNetworkMocker(),
  })

  return wrapWith()
}

const wrapWith = (): Wrap => {
  const extensions = extendWith()

  return {
    withProps,
    withNetwork,
    withMSW,
    withInteraction,
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

const setNetworkMocker = (networkMocker: NetworkMocker) => {
  const options = getOptions()
  updateOptions({ ...options, networkMocker })
}

const applyExtension = (args: any[], extension: Extension) => {
  const wrapExtensionAPI: WrapExtensionAPI = { addResponses, setNetworkMocker }

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

const withInteraction = (interactionConfig: unknown) => {
  const options = getOptions()
  updateOptions({ ...options, interactionConfig })
  return wrapWith()
}

const withNetwork = (responses: Response | Response[] = []) => {
  const options = getOptions()
  const listOfResponses = Array.isArray(responses) ? responses : [responses]

  updateOptions({
    ...options,
    responses: [...options.responses, ...listOfResponses],
    networkMocker: createMswNetworkMocker(),
  })

  return wrapWith()
}

const withMSW = withNetwork

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
  const { portal, portals, changeRoute, history, mount, interaction } =
    getConfig()
  const {
    Component,
    props,
    responses,
    path,
    hasPath,
    debug,
    historyState,
    interactionConfig,
    networkMocker,
  } = getOptions()

  const C = Component as React.JSXElementConstructor<unknown>

  if (portal) {
    setupPortal(portal)
  }

  if (portals) {
    setupPortals(portals)
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

  const mocker = networkMocker ?? createMswNetworkMocker()
  mocker(responses, debug)

  const rendered = mount(<C {...props} />)

  if (!!interaction) {
    const user = interaction.setup
      ? interaction.setup(interaction.userLib, interactionConfig)
      : interaction.userLib

    return {
      ...rendered,
      user: user,
    }
  }

  return {
    ...rendered,
    user: undefined,
  }
}

const setupPortal = (portalRootId: string) => {
  if (document.getElementById(portalRootId)) {
    return
  }

  const portalRoot = document.createElement('div')
  portalRoot.setAttribute('id', portalRootId)
  portalRoot.setAttribute('data-testid', portalRootId)
  document.body.appendChild(portalRoot)
}

const setupPortals = (portalRootIds: string[]) => {
  portalRootIds.forEach(portal => {
    setupPortal(portal)
  })
}

export { wrap }
