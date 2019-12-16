import { render } from 'react-dom'

const mount = component => {
  const rootNode = document.body.appendChild(document.createElement('div'))

  render(component, rootNode)

  return rootNode
}

let config = {
  defaultHost: '',
  mount,
  defaultStore: {},
  reducers: null,
}

function configureMocks(newConfig) {
  config = {
    ...config,
    ...newConfig,
  }
}

const getMocksConfig = () => ({ ...config })

export { configureMocks, getMocksConfig }