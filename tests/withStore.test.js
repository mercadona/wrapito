import { render } from '@testing-library/react'
import { wrap, configureMocks } from '../src/index'
import { MyComponentWithStore } from './components.mock'

const mount = (defaultStore, store) => {
  const session = (state = { isAuth: false }) => state

  configureMocks({ defaultStore, reducers: session, mount: render })
  return wrap(MyComponentWithStore).withStore(store).mount()
}

it('should have default store', () => {
  const defaultStore = { session: { isAuth: true, user: 'Anonymous' } }

  const { container } = mount(defaultStore)

  expect(container).toHaveTextContent('Hello Anonymous')
})

it('should have a initial store state if specified', () => {
  const defaultStore = { session: { isAuth: true } }
  const store = { session: { isAuth: true, user: 'Spiderman' } }

  const { container } = mount(defaultStore, store)

  expect(container).toHaveTextContent('Hello Spiderman')
})

it('should throw if it does not have any reducer', () => {
  configureMocks({ reducers: null })

  expect(
    () => wrap(MyComponentWithStore).withStore().mount()
  ).toThrow([
    'reducers needs to be specified',
    'it can be set by doing configureMocks({ defaultStore, reducers })',
  ].join(','))
})