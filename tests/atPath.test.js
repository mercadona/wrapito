import React from 'react'
import { wrap, configureMocks as configure } from '../src'
import { render } from '@testing-library/react'

import { MyAppWithRouting, history } from './components.mock'

configure({ mount: render })

it('should render a simple app', () => {
  const { container } = wrap(MyAppWithRouting).mount()

  expect(container).toHaveTextContent('Home')
})

it('should render an app with routing', () => {
  const { container } = wrap(MyAppWithRouting)
    .mount()

  expect(container).toHaveTextContent('Home')
})

it('should render an app with routing given an specific path', () => {
  configure({ history })
  const { container } = wrap(MyAppWithRouting)
    .atPath('/categories')
    .mount()

  expect(container).toHaveTextContent('Categories')
})

it('should render an app with routing given an specific path', () => {
  configure({ history })
  const { container } = wrap(MyAppWithRouting)
    .atPath('/')
    .mount()

  expect(container).toHaveTextContent('Home')
})