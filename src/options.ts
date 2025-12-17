import type { WrapOptions } from './@types/models'

let options: WrapOptions

const updateOptions = (updatedOptions: WrapOptions) => {
  options = {
    ...options,
    ...updatedOptions,
  }
}

const getOptions = (): WrapOptions => ({ ...options })

export { options, updateOptions, getOptions }
