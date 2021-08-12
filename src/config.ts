import { render } from 'react-dom'

import { Component, Config, Mount } from './models'

const mount = (component: Component) => {
  const rootNode = document.body.appendChild(document.createElement('div'))

  render(component, rootNode)

  return rootNode
}

let config: Config = {
  defaultHost: '',
  extend: {},
  mount,
}

function configure(newConfig: Config) {
  config = {
    ...config,
    ...newConfig,
  }
}

const getConfig = (): Config => ({ ...config })

export { configure, getConfig, Config, Mount }
