import { render } from 'react-dom'

const mount = component => {
  const rootNode = document.body.appendChild(document.createElement('div'))

  render(component, rootNode)

  return rootNode
}

let config = {
  defaultHost: '',
  mount,
}

function configure(newConfig) {
  config = {
    ...config,
    ...newConfig,
  }
}

interface History {
  push: (path: string) => {},
}

interface ConfigType {
  defaultHost: string,
  mount: (component: object) => {},
  extend?: object,
  portal?: string,
  history?: History,
}

const getConfig = ():ConfigType => ({ ...config })

export { configure, getConfig }