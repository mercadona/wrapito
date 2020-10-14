import { render, cleanup } from '@testing-library/react'
import { wrap, configure } from '../src/index'
import { getConfig } from '../src/config'
import { MyComponent, MyComponentWithProps, MyComponentWithPortal } from './components.mock'

const portalRootId = 'portal-root-id'

const removePortals = portalRootId => {
  const portal = document.getElementById(portalRootId)
  if (!portal) { return }
  document.body.removeChild(portal)
}

const defaultMocksConfig = getConfig()

function resetMocksConfig() {
  configure(defaultMocksConfig)
  cleanup()
  removePortals(portalRootId)
}

afterEach(resetMocksConfig)

it('should have props', () => {
  configure({ mount: render })
  const props = { foo: 'bar' }

  const { container } = wrap(MyComponentWithProps).withProps(props).mount()

  expect(container).toHaveTextContent(props.foo)
})

fit('should have an element where to place a portal defined in the config', () => {
  const childrenText = 'I am a portal'
  const props = { children: childrenText }
  configure({ portal: 'portal-root-id' })

  wrap(MyComponentWithPortal).withProps(props).mount()

  expect(document.body).toHaveTextContent(childrenText)
})

it('should have an element where to place a portal', () => {
  const childrenText = 'I am a portal'
  const props = { children: childrenText }

  wrap(MyComponentWithPortal).withProps(props).withPortalAt(portalRootId).mount()

  expect(document.body).toHaveTextContent(childrenText)
})

it('should have unique portals', () => {
  configure({ mount: render })
  const childrenText = 'I am a portal'
  const props = { children: childrenText }

  wrap(MyComponentWithPortal).withProps(props).withPortalAt(portalRootId).mount()
  wrap(MyComponentWithPortal).withProps(props).withPortalAt(portalRootId).mount()

  expect(document.querySelectorAll(`#${ portalRootId }`)).toHaveLength(1)
})

it('should use the default mount', () => {
  const expectedText = 'Foo'
  const { textContent } = wrap(MyComponent).mount()

  expect(textContent).toBe(expectedText)
})

it('should use a custom mount', () => {
  configure({ mount: render })
  const expectedText = 'Foo'

  const { container } = wrap(MyComponent).mount()

  expect(container).toHaveTextContent(expectedText)
})
