import type { WrapOptions } from './models'

let options: WrapOptions

const updateOptions = (updatedOptions: WrapOptions) => {
  options = {
    ...options,
    ...updatedOptions,
  }
}

const getOptions = (): WrapOptions => ({ ...options })

export { options, updateOptions, getOptions }
