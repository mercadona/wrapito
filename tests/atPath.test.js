import { wrap, configure } from '../src'
import { render, fireEvent, screen } from '@testing-library/react'

import {
  MyAppWithRouting,
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

it('should render an app with routing given an specific path using changeRoute', () => {
  const functionCalledByHomeRoute = jest.spyOn(myFakeModule, 'myFakeFunction')
  configure({ changeRoute: history.push })
  const { container } = wrap(MyAppWithRouting).atPath('/categories').mount()

  expect(functionCalledByHomeRoute).not.toHaveBeenCalledWith('HOME')
  expect(container).toHaveTextContent('Categories')
})

it('should render an app with routing given an specific path using history', () => {
  const functionCalledByHomeRoute = jest.spyOn(myFakeModule, 'myFakeFunction')
  configure({ history })
  const { container } = wrap(MyAppWithRouting).atPath('/categories').mount()

  expect(functionCalledByHomeRoute).not.toHaveBeenCalledWith('HOME')
  expect(container).toHaveTextContent('Categories')
})

it('should warn that history config is deprecated', () => {
  const warn = jest.spyOn(console, 'warn')
  configure({ history })
  wrap(MyAppWithRouting).atPath('/categories').mount()

  expect(warn).toHaveBeenCalledWith(
    'wrapito WARNING: history is DEPRECATED. Pass a changeRoute function to the config instead.',
  )
  configure({ history: null })
})

it('should render an app with a routing logic between pages', () => {
  configure({ changeRoute: history.push })
  const { container, getByText } = wrap(MyAppWithRouting).atPath('/').mount()

  expect(container).toHaveTextContent('Home')

  fireEvent.click(getByText('Go to categories'))

  expect(container).toHaveTextContent('Categories')
})

it('should render an app with a location state', async () =>{
  configure({ history })
  wrap(MyAppWithRouting).atPath('/page-using-location-state', {title: "title"}).mount()

  expect(await screen.findByText('title')).toBeInTheDocument()
}) 
