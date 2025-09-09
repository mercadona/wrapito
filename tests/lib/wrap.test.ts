import { render, cleanup, screen } from '@testing-library/react'
import { wrap, configure } from '../../src/index'
import { getConfig } from '../../src/config'
import {
  MyComponent,
  MyComponentWithProps,
  MyComponentWithPortal,
  MyComponentWithPortals,
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
  const props = { foo: 'bar' }

  const { container } = wrap(MyComponentWithProps).withProps(props).mount()

  expect(container).toHaveTextContent(props.foo)
})

it('should have an element where to place a portal defined in the config', () => {
  const childrenText = 'I am a portal'
  const props = { children: childrenText }
  configure({ portal: 'portal-root-id' })

  wrap(MyComponentWithPortal).withProps(props).mount()

  expect(document.body).toHaveTextContent(childrenText)
})

it('should have elements where to place portals defined in the config', () => {
  const childrenTexts = ['I am a portal 1', 'I am a portal 2']
  const portalIds = ['portal-root-id1', 'portal-root-id2']

  configure({ portals: portalIds })
  const props = { children: childrenTexts, portalIds }

  wrap(MyComponentWithPortals).withProps(props).mount()

  childrenTexts.forEach(childrenText => {
    expect(document.body).toHaveTextContent(childrenText)
  })
})

it('should have unique portals', () => {
  configure({ portal: portalRootId })
  const childrenText = 'I am a portal'
  const props = { children: childrenText }

  wrap(MyComponentWithPortal).withProps(props).mount()
  wrap(MyComponentWithPortal).withProps(props).mount()

  expect(document.querySelectorAll(`#${portalRootId}`)).toHaveLength(1)
})

it('should have data-testid for portal', () => {
  configure({ portal: portalRootId })
  const childrenText = 'I am a portal'
  const props = { children: childrenText }

  wrap(MyComponentWithPortal).withProps(props).mount()

  expect(screen.getByTestId(portalRootId)).toBeInTheDocument()
})
