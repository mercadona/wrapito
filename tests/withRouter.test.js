import { render } from '@testing-library/react'
import { wrap, configureMocks } from '../src/index'
import { MyComponentWithRouter } from './components.mock'

configureMocks({ mount: render })

it('should have default routing', () => {
  const { container } = wrap(MyComponentWithRouter).withRouter().mount()

  expect(container).toHaveTextContent('Current route: "/"')
})

it('should have current route if specified', () => {
  const routing = {
    currentRoute: {
      exact: true,
      path: '/my/path/with/param/:myParam',
      route: '/my/path/with/param/5',
    },
  }
  const { container } = wrap(MyComponentWithRouter).withRouter(routing).mount()

  expect(container).toHaveTextContent('Current route: "/my/path/with/param/5"')
})