import { wrap, configureMocks as configure } from '../src'
import { render, fireEvent } from '@testing-library/react'

import { MyAppWithRouting, history, myFakeModule } from './components.mock'

configure({ mount: render })

afterEach(jest.restoreAllMocks)

it('should render an app with routing', () => {
  const { container } = wrap(MyAppWithRouting)
    .mount()

  expect(container).toHaveTextContent('Home')
})

it('should render an app with routing given an specific path', () => {
  const functionCalledByHomeRoute = jest.spyOn(myFakeModule, 'myFakeFunction')
  configure({ history })
  const { container } = wrap(MyAppWithRouting)
    .atPath('/categories')
    .mount()

  expect(functionCalledByHomeRoute).not.toHaveBeenCalledWith('HOME')
  expect(container).toHaveTextContent('Categories')
})

it('should render an app with routing given an specific path', () => {
  configure({ history })
  const { container } = wrap(MyAppWithRouting)
    .atPath('/')
    .mount()

  expect(container).toHaveTextContent('Home')
})

it('should render an app with a routing logic between pages', () => {
  configure({ history })
  const { container, getByText } = wrap(MyAppWithRouting)
    .atPath('/')
    .mount()

  expect(container).toHaveTextContent('Home')

  fireEvent.click(getByText('Go to categories'))

  expect(container).toHaveTextContent('Categories')
})