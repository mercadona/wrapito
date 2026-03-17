import * as React from 'react'

import { mockNetwork, setupLateRequestWarning } from './mockNetwork'
import { getConfig } from './config'
import { updateOptions, getOptions } from './options'
import type {
  Response,
  Wrap,
  WrapExtensionAPI,
  Extension,
  Extensions,
  BrowserHistory,
} from './models'
import { enhancedSpy } from './utils/tinyspyWrapper'

// @ts-expect-error
beforeEach(() => {
  // @ts-expect-error
  global.fetch = enhancedSpy()
})

// @ts-expect-error
afterEach(() => {
  const { warnOnPendingRequests } = getConfig()
  if (warnOnPendingRequests) {
    // @ts-expect-error
    const testName = expect.getState?.()?.currentTestName
    setupLateRequestWarning(testName)
  }
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

const buildResponses = (responses: Response[]): Response[] => {
  const { defaultResponses = [] } = getConfig()
  return [...responses, ...defaultResponses]
}

const setupRoute = (
  hasPath: boolean,
  path: string,
  historyState: object | undefined,
  history: BrowserHistory | undefined,
  changeRoute: (path: string) => void,
) => {
  if (!hasPath) return

  if (history) {
    console.warn(
      'wrapito WARNING: history is DEPRECATED. Pass a changeRoute function to the config instead.',
    )
    console.warn(
      'Read about changeRoute in: https://github.com/mercadona/wrapito#changeRoute',
    )
    history.push(path, historyState)
    return
  }

  changeRoute(path)
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

  setupRoute(hasPath, path, historyState, history, changeRoute)

  mockNetwork(buildResponses(responses), debug)

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
