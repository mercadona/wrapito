import { wrap, configureMocks as configure } from '../src'
import { render , fireEvent } from '@testing-library/react'

import { MyAppWithStore } from './components.mock'

configure({ mount: render })

it('should render a simple app', () => {
  const { container } = wrap(MyAppWithStore).mount()

  expect(container).toHaveTextContent('10')
})

it('should render a simple app and fire a store action', () => {
  const { container, getByText } = wrap(MyAppWithStore).mount()

  expect(container).toHaveTextContent('10')

  fireEvent.click(getByText('+'))

  expect(container).toHaveTextContent('11')
})

it('should render an app using redux middlewares', () => {
  const { container, getByText } = wrap(MyAppWithStore).mount()

  expect(container).toHaveTextContent('10')

  fireEvent.click(getByText('-'))

  expect(container).toHaveTextContent('9')
})
