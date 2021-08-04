import { render } from 'react-dom'

afterEach(resetConfig)

const mount = component => {
  const rootNode = document.body.appendChild(document.createElement('div'))

  render(component, rootNode)

  return rootNode
}

const defaultConfig = {
  defaultHost: '',
  mount,
}

let config = { ...defaultConfig }

function resetConfig() {
  config = { ...defaultConfig }
}

function configure(newConfig) {
  config = {
    ...config,
    ...newConfig,
  }
}

const getConfig = () => ({ ...config })

export { configure, getConfig }

