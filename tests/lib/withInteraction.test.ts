import { cleanup } from '@testing-library/react'
import { wrap, configure } from '../../src/index'
import { getConfig } from '../../src/config'
import { MyComponentWithProps } from '../components.mock'
import { it, expect, afterEach, vi } from 'vitest'

const defaultMocksConfig = getConfig()

function resetMocksConfig() {
  configure(defaultMocksConfig)
  cleanup()
}

afterEach(() => {
  resetMocksConfig()
})

it('should return user object', () => {
  const myInteractionLib = vi.fn()

  const props = { foo: 'bar' }
  configure({
    interaction: {
      lib: myInteractionLib,
    },
  })

  const { user } = wrap(MyComponentWithProps).withProps(props).mount()

  expect(user).toBeDefined()
})
