let config

function configureMocks(newConfig) {
  config = {
    defaultHost: '',
    ...newConfig,
  }
}

const getMocksConfig = () => ({ ...config })

export { configureMocks, getMocksConfig }