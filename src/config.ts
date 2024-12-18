import { render } from 'react-dom'

import type { Component, Config, RenderResult } from './models'

const mount = (Component: Component): RenderResult => {
  const rootNode = document.body.appendChild(document.createElement('div'))

  render(Component, rootNode)

  return rootNode
}

let config: Config = {
  defaultHost: '',
  extend: {},
  mount,
  changeRoute: (path: string) => window.history.replaceState(null, '', path),
}

function configure(newConfig: Partial<Config>) {
  config = {
    ...config,
    ...newConfig,
  }
}

const getConfig = (): Config => ({ ...config })

export { configure, getConfig, Config, mount }
