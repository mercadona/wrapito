import { wrap, configure } from '../src'
import { render, fireEvent, screen } from '@testing-library/react'

import {
  MyAppWithRouting,
  MyAppWithBrowserRouting,
  MyComponent,
  history,
  myFakeModule,
} from './components.mock'

configure({ mount: render })

it('should render an app with routing', () => {
  const { container } = wrap(MyAppWithRouting).mount()

  expect(container).toHaveTextContent('Home')
})

it('should render an app without routing with specific url', () => {
  wrap(MyComponent).atPath('/?query=query').mount()

  expect(screen.getByText('Foo')).toBeInTheDocument()
  expect(window.location.href).toBe('http://localhost/?query=query')
})

it('should render an app with routing given an specific path', () => {
  const functionCalledByHomeRoute = jest.spyOn(myFakeModule, 'myFakeFunction')
  configure({ changeRoute: history.push })
  const { container } = wrap(MyAppWithRouting).atPath('/categories').mount()

  expect(functionCalledByHomeRoute).not.toHaveBeenCalledWith('HOME')
  expect(container).toHaveTextContent('Categories')
})

it('should render an app with a routing logic between pages', () => {
  configure({ changeRoute: history.push })
  const { container, getByText } = wrap(MyAppWithRouting).atPath('/').mount()

  expect(container).toHaveTextContent('Home')

  fireEvent.click(getByText('Go to categories'))

  expect(container).toHaveTextContent('Categories')
})

it('should render an app with browser routing given an specific path without history', () => {
  configure({ changeRoute: null })
  wrap(MyAppWithBrowserRouting).atPath('/categories').mount()

  expect(screen.getByText('Categories')).toBeInTheDocument()
})

