import { render, wait, fireEvent } from '@testing-library/react'
import { wrap, configureMocks } from '../src/index'
import { getMocksConfig } from '../src/config'
import {
  MyComponent,
  MyComponentWithProps,
  MyComponentWithPortal,
  MyComponentWithStore,
  MyComponentWithRouter,
  MyComponentMakingHttpCalls,
  MyComponentRepeatingHttpCalls,
} from './components.mock'
import { refreshProductsList, getTableRowsText } from './helpers'

const defaultMocksConfig = getMocksConfig()

function resetMocksConfig() {
  configureMocks(defaultMocksConfig)
  jest.restoreAllMocks()
}

describe('burrito', () => {
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

  it('should have default routing', () => {
    configureMocks({ mount: render })

    const { container } = wrap(MyComponentWithRouter).withRouter().mount()

    expect(container).toHaveTextContent('Current route: "/"')
  })

  it('should have current route if specified', () => {
    configureMocks({ mount: render })
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

  it('should have default store', () => {
    const session = (state = { isAuth: false }) => state
    const defaultStore = { session: { isAuth: true, user: 'Anonymous' } }

    configureMocks({ defaultStore, reducers: session, mount: render })
    const { container } = wrap(MyComponentWithStore).withStore().mount()

    expect(container).toHaveTextContent('Hello Anonymous')
  })

  it('should have a initial store state if specified', () => {
    const session = (state = { isAuth: false }) => state
    const defaultStore = { session: { isAuth: true } }
    const store = { session: { isAuth: true, user: 'Spiderman' } }

    configureMocks({ defaultStore, reducers: session, mount: render })
    const { container } = wrap(MyComponentWithStore).withStore(store).mount()

    expect(container).toHaveTextContent('Hello Spiderman')
  })

  it('should throw if it does not have any reducer', () => {
    expect(
      () => wrap(MyComponent).withStore().mount()
    ).toThrow([
      'reducers needs to be specified',
      'it can be set by doing configureMocks({ defaultStore, reducers })',
    ].join(','))
  })

  it('should have mocks', async () => {
    configureMocks({ mount: render })
    const { container } = wrap(MyComponentMakingHttpCalls)
      .withMocks({ method: 'get', path: '/path/to/get/quantity/', host: 'my-host', responseBody: '15', status: 200 })
      .mount()

      expect(container).toHaveTextContent('quantity: 0')

      await wait(() => {
        expect(container).toHaveTextContent('quantity: 15')
      })
  })

  it('should have default mocks', async () => {
    configureMocks({ defaultHost: 'my-host', mount: render })
    const { container } = wrap(MyComponentMakingHttpCalls)
      .withMocks({ path: '/path/to/get/quantity/', responseBody: '15' })
      .mount()

    expect(container).toHaveTextContent('quantity: 0')

    await wait(() => {
      expect(container).toHaveTextContent('quantity: 15')
    })
  })

  it('should try to match the request body as well', async () => {
    configureMocks({ defaultHost: 'my-host', mount: render })
    const quantity = '15'
    const { getByText, getByLabelText, queryByLabelText, getByTestId } = wrap(MyComponentMakingHttpCalls)
      .withMocks([
        { path: '/path/to/get/quantity/', responseBody: quantity },
        { method: 'post', path: '/path/to/save/quantity/', requestBody: { quantity } },
      ])
      .mount()

    await wait(() => getByText('quantity: 15'))
    expect(queryByLabelText('quantity saved')).not.toBeInTheDocument()

    fireEvent.click(getByTestId('quantity'))

    await wait(() => expect(getByLabelText('quantity saved')).toBeInTheDocument())
  })

  it('should mock different responses given the same request', async () => {
    configureMocks({ defaultHost: 'my-host', mount: render })

    const productsBeforeRefreshing = ['tomato', 'orange']
    const productsAfterRefreshing = ['tomato', 'orange', 'apple']
    const { container } = wrap(MyComponentRepeatingHttpCalls)
      .withMocks({
        path: '/path/to/get/products/',
        multipleResponses: [
          { responseBody: productsBeforeRefreshing },
          { responseBody: productsAfterRefreshing },
        ],
      })
      .mount()

    refreshProductsList(container)
    await wait(() =>
      expect(getTableRowsText(container)).toEqual(productsBeforeRefreshing)
    )

    refreshProductsList(container)
    await wait(() =>
      expect(getTableRowsText(container)).toEqual(productsAfterRefreshing)
    )
  })

  it('should not have enough responses specified', async () => {
    configureMocks({ defaultHost: 'my-host', mount: render })
    console.warn = jest.fn()

    const products = ['tomato', 'orange']
    const { container } = wrap(MyComponentRepeatingHttpCalls)
      .withMocks({
        path: '/path/to/get/products/',
        multipleResponses: [
          { responseBody: products },
        ],
      })
      .mount()

    refreshProductsList(container)
    await wait(() =>
      expect(getTableRowsText(container)).toEqual(products)
    )

    refreshProductsList(container)
    await wait(() =>
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('all responses have been returned already given')
      )
    )
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
})