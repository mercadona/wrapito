import { render } from '@testing-library/react'
import { wrap, configureMocks } from '../src/index'
import { getMocksConfig } from '../src/config'
import { MyComponent, MyComponentWithProps, MyComponentWithPortal } from './components.mock'

const defaultMocksConfig = getMocksConfig()

function resetMocksConfig() {
  configureMocks(defaultMocksConfig)
}

afterEach(resetMocksConfig)

it('should have props', () => {
  configureMocks({ mount: render })
  const props = { foo: 'bar' }

  const { container } = wrap(MyComponentWithProps).withProps(props).mount()

  expect(container).toHaveTextContent(props.foo)
})

it('should have an element where to place a portal', () => {
  configureMocks({ mount: render })
  const childrenText = 'I am a portal'
  const portalRootId = 'portal-root-id'
  const props = { children: childrenText }

  wrap(MyComponentWithPortal).withProps(props).withPortalAt(portalRootId).mount()

  expect(document.body).toHaveTextContent(childrenText)
})

it('should use the default mount', () => {
  const expectedText = 'Foo'
  const { textContent } = wrap(MyComponent).mount()

  expect(textContent).toBe(expectedText)
})

it('should use a custom mount', () => {
  configureMocks({ mount: render })
  const expectedText = 'Foo'

  const { container } = wrap(MyComponent).mount()

  expect(container).toHaveTextContent(expectedText)
})