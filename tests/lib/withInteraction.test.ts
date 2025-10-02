import { cleanup } from '@testing-library/react'
import { wrap, configure } from '../../src/index'
import { getConfig } from '../../src/config'
import { MyComponentWithProps } from '../components.mock'
import { it, expect, afterEach, vi } from 'vitest'
import { describe } from 'node:test'

const defaultMocksConfig = getConfig()

function resetMocksConfig() {
  configure(defaultMocksConfig)
  cleanup()
}

afterEach(() => {
  resetMocksConfig()
})
describe('Wrapito with interaction', () => {
  it('should return user object', () => {
    const myInteractionLib = vi.fn()

    configure({
      interaction: {
        lib: myInteractionLib,
      },
    })

    const { user } = wrap(MyComponentWithProps).mount()

    expect(user).toBeDefined()
  })

  it('should execute the interaction setup function and return the instance', () => {
    const expectedInstance = 'myInstance'
    const setupMock = vi.fn().mockImplementation(() => expectedInstance)

    const interactionLib = {
      setup: setupMock,
    }

    configure({
      interaction: {
        lib: interactionLib,
        setup: libInstance => libInstance.setup(),
      },
    })

    const { user } = wrap(MyComponentWithProps).mount()

    expect(user).toBe(expectedInstance)
    expect(setupMock).toHaveBeenCalled()
  })

  it('should execute setup with its own config when provided in withInteraction', () => {
    const expectedInstance = 'myInstance'
    const setupMock = vi.fn().mockImplementation(() => expectedInstance)

    const interactionLib = {
      setup: setupMock,
    }

    configure({
      interaction: {
        lib: interactionLib,
        setup: (libInstance, config) => libInstance.setup(config),
      },
    })

    const localConfig = { myConfig: true }

    const { user } = wrap(MyComponentWithProps)
      .withInteraction(localConfig)
      .mount()

    expect(user).toBe(expectedInstance)
    expect(setupMock).toHaveBeenCalledWith(localConfig)
  })
})
