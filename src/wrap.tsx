import * as React from 'react'

import { mockNetwork } from './mockNetwork'
import { getConfig } from './config'
import { getOptions, updateOptions } from './options'
import type { Extension, Extensions, Response, Wrap, WrapExtensionAPI } from './models'
import { MockInstance, spyOn } from '@vitest/spy'
import {
  fetch as ponyfillFetch,
  Headers as PonyHeaders,
  Request as PonyRequest,
  Response as PonyResponse,
} from 'whatwg-fetch'

// Ensure window.fetch exists so the spy below doesn't wrap undefined (CI/jsdom can lack it or other tests may reset it)
const ensureWindowFetch = () => {
  if (typeof global.window === 'undefined') return

  if (typeof global.window.fetch !== 'function') {
    const candidate =
      typeof globalThis.fetch === 'function' ? globalThis.fetch : ponyfillFetch

    if (candidate) {
      // @ts-ignore
      global.window.fetch = candidate.bind(globalThis) as typeof globalThis.fetch
    }
  }

  if (!global.window.Request && PonyRequest) {
    global.window.Request = PonyRequest as typeof globalThis.Request
  }
  if (!global.window.Response && PonyResponse) {
    global.window.Response = PonyResponse as typeof globalThis.Response
  }
  if (!global.window.Headers && PonyHeaders) {
    global.window.Headers = PonyHeaders as typeof globalThis.Headers
  }
}

// @ts-expect-error
beforeEach(() => {
  ensureWindowFetch()
  spyOn(global.window, 'fetch').mockRejectedValue(new Error('Mock instance failed.'))
})

// @ts-expect-error
afterEach(() => {
  const mockedFetch = global.window.fetch as MockInstance
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
  })

  return wrapWith()
}

const wrapWith = (): Wrap => {
  const extensions = extendWith()

  return {
    withProps,
    withNetwork,
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

  mockNetwork(responses, debug)

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
