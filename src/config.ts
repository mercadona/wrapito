import { render } from '@testing-library/react'
import type { Config } from './@types/models'
import { extendExpect } from './utils/extendExpect'

let config: Config = {
  defaultHost: '',
  extend: {},
  mount: render,
  changeRoute: (path: string) => window.history.replaceState(null, '', path),
}

extendExpect()

function configure(newConfig: Partial<Config>) {
  config = {
    ...config,
    ...newConfig,
  }
}

const getConfig = (): Config => ({ ...config })

export { configure, getConfig, Config }
