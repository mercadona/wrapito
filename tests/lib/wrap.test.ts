import { render, cleanup } from '@testing-library/react'
import { wrap, configure } from '../../src/index'
import { getConfig } from '../../src/config'
import {
  MyComponent,
  MyComponentWithProps,
  MyComponentWithPortal,
} from '../components.mock'
import { it, expect, afterEach } from 'vitest'

const portalRootId = 'portal-root-id'

const removePortals = (portalRootId: string) => {
  const portal = document.getElementById(portalRootId)
  if (!portal) {
    return
  }
  document.body.removeChild(portal)
}

const defaultMocksConfig = getConfig()

function resetMocksConfig() {
  configure(defaultMocksConfig)
  cleanup()
  removePortals(portalRootId)
}

afterEach(() => {
  resetMocksConfig()
})

it('should have props', () => {
  configure({ mount: render })
  const props = { foo: 'bar' }

  const { container } = wrap(MyComponentWithProps).withProps(props).mount()

  expect(container).toHaveTextContent(props.foo)
})

it('should have unique portals', () => {
  configure({ mount: render, portal: portalRootId })
  const childrenText = 'I am a portal'
  const props = { children: childrenText }

  wrap(MyComponentWithPortal).withProps(props).mount()
  wrap(MyComponentWithPortal).withProps(props).mount()

  expect(document.querySelectorAll(`#${portalRootId}`)).toHaveLength(1)
})

it('should use a custom mount', () => {
  configure({ mount: render })
  const expectedText = 'Foo'

  const { container } = wrap(MyComponent).mount()

  expect(container).toHaveTextContent(expectedText)
})
