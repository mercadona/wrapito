import { mount } from 'enzyme'

const mountUsingEnzyme = Component => {
  const componentMounted = mount(Component)

  componentMounted.asyncFind = selector => {
    return new Promise(resolve => {
      setImmediate(() => {
        componentMounted.update()

        resolve(componentMounted.find(selector))
      })
    })
  }

  return componentMounted
}

let config = {
  defaultHost: '',
  mount: mountUsingEnzyme,
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