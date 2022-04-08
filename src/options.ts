import { WrapOptions } from "./models";

let options: WrapOptions

const updateOptions = (updatedOptions: WrapOptions) => {
  options = {
    ...options,
    ...updatedOptions,
  }
}

export { options, updateOptions }