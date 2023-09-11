import { render } from 'react-dom'

import { Component, Config, Mount } from './models'

import { jest } from '@jest/globals'

const mount = (component: Component) => {
  const rootNode = document.body.appendChild(document.createElement('div'))

  render(component, rootNode)

  return rootNode
}

let config: Config = {
  defaultHost: '',
  extend: {},
  mount,
  changeRoute: (path: string) => window.history.replaceState(null, '', path),
  isVitestEnv: false,
  testRunner: jest
}

function configure(newConfig: Config) {
  config = {
    ...config,
    ...newConfig,
  }
}

const getConfig = (): Config => ({ ...config })

export { configure, getConfig, Config, Mount }
