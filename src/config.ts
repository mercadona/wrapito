import { render } from '@testing-library/react'
import type { Config } from './models'

let config: Config = {
  defaultHost: '',
  extend: {},
  mount: render,
  changeRoute: (path: string) => window.history.replaceState(null, '', path),
}

function configure(newConfig: Partial<Config>) {
  config = {
    ...config,
    ...newConfig,
  }
}

const getConfig = (): Config => ({ ...config })

export { configure, getConfig, Config }
