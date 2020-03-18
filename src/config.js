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

const getConfig = () => ({ ...config })

export { configure, getConfig }