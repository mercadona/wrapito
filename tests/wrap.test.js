import { render } from 'react-dom'
import { combineReducers } from 'redux'
import { wrap, configureMocks } from '../src/index'
import { getMocksConfig } from '../src/config'
import { MyComponent, MyAsyncComponent, MyComponentMakingHttpCalls } from './components.mock'

const defaultMocksConfig = getMocksConfig()

function resetMocksConfig() {
  configureMocks(defaultMocksConfig)
}

describe('wrap', () => {
  afterEach(resetMocksConfig)

  it('should render correctly', () => {
    const myComponent = wrap(MyComponent).mount()
    expect(myComponent).toBeDefined()
    expect(myComponent.exists()).toBeTruthy()
  })

  it('should expose a way to find elements asynchronously', async () => {
    const myAsyncComponent = wrap(MyAsyncComponent).mount()

    expect(myAsyncComponent).toHaveProperty('asyncFind')
    const title = await myAsyncComponent.asyncFind('[data-test="title"]')
    expect(title.exists()).toBeTruthy()
  })

  it('should have props', () => {
    const props = { foo: 'bar' }
    const myComponentWithProps = wrap(MyComponent).withProps(props).mount()
    const expectedProps = expect.objectContaining(props)

    expect(myComponentWithProps.props()).toEqual(expectedProps)
  })

  it('should have an element where to place a portal', () => {
    const portalRootId = 'portal-root'

    wrap(MyComponent).withPortalAt(portalRootId).mount()
    const portalRoot = document.querySelector(`#${ portalRootId }`)

    expect(portalRoot).toBeDefined()
  })

  it('should have default routing', () => {
    const myComponentWithRouter = wrap(MyComponent).withRouter().mount()
    const expectedProps = expect.objectContaining({
      history: expect.anything(),
      location: expect.anything(),
      match: expect.anything(),
    })

    expect(myComponentWithRouter.find(MyComponent).props()).toEqual(expectedProps)
  })

  it('should have current route if specified', () => {
    const routing = {
      currentRoute: {
        exact: true,
        path: '/my/path/with/param/:myParam',
        route: '/my/path/with/param/5',
      },
    }

    const myComponentWithRouter = wrap(MyComponent).withRouter(routing).mount()
    const expectedProps = expect.objectContaining({
      history: expect.anything(),
      location: expect.anything(),
      match: expect.objectContaining({
        isExact: routing.currentRoute.exact,
        params: {
          myParam: '5',
        },
        path: routing.currentRoute.path,
        url: routing.currentRoute.route,
      }),
    })

    expect(myComponentWithRouter.find(MyComponent).props()).toEqual(expectedProps)
  })

  it('should have default store', () => {
    const products = (state = 10, action) => state
    const session = (state = { isAuth: false }, action) => state
    const reducers = combineReducers({ products, session })
    const defaultStore = { session: { isAuth: true } }
    const expectedStoreState = { ...reducers(), ...defaultStore }

    configureMocks({ defaultStore, reducers })
    const myComponentWithStore = wrap(MyComponent).withStore().mount()

    const storeState = myComponentWithStore.props().store.getState()
    expect(storeState).toEqual(expectedStoreState)
  })

  it('should have a initial store state if specified', () => {
    const store = { products: 50 }
    const products = (state = 10, action) => state
    const session = (state = { isAuth: false }, action) => state
    const reducers = combineReducers({ products, session })
    const defaultStore = { session: { isAuth: true } }
    const expectedStoreState = { ...defaultStore, ...store }

    configureMocks({ defaultStore, reducers })
    const myComponentWithStore = wrap(MyComponent).withStore(store).mount()

    const storeState = myComponentWithStore.props().store.getState()
    expect(storeState).toEqual(expectedStoreState)
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
    const myComponentMakingHttpCalls = wrap(MyComponentMakingHttpCalls)
      .withMocks({ method: 'get', path: '/path/to/get/quantity/', host: 'my-host', responseBody: '15', status: 200 })
      .mount()

    const quantity = (await myComponentMakingHttpCalls.asyncFind('[data-test="quantity"]')).text()
    expect(quantity).toBe('15')
  })

  it('should have default mocks', async () => {
    configureMocks({ defaultHost: 'my-host' })
    const myComponentMakingHttpCalls = wrap(MyComponentMakingHttpCalls)
      .withMocks({ path: '/path/to/get/quantity/', responseBody: '15' })
      .mount()

    const quantity = (await myComponentMakingHttpCalls.asyncFind('[data-test="quantity"]')).text()
    expect(quantity).toBe('15')
  })

  it('should try to match the request body as well', async () => {
    configureMocks({ defaultHost: 'my-host' })
    const quantity = '15'
    const myComponentMakingHttpCalls = wrap(MyComponentMakingHttpCalls)
      .withMocks([
        { path: '/path/to/get/quantity/', responseBody: quantity },
        { method: 'post', path: '/path/to/save/quantity/', requestBody: { quantity } },
      ])
      .mount()

    const successIconBeforeSave = (await myComponentMakingHttpCalls.asyncFind('[aria-label="quantity saved"]'))
    expect(successIconBeforeSave).toHaveLength(0)
    myComponentMakingHttpCalls.find('[data-test="quantity"]').simulate('click')

    const successIconAfterSave = (await myComponentMakingHttpCalls.asyncFind('[aria-label="quantity saved"]'))
    expect(successIconAfterSave).toHaveLength(1)
  })

  it('should use Enzyme by default', () => {
    const expectedText = 'Foo'
    const mountedWithEnzymeComponent = wrap(MyComponent).mount()

    const textFoundByUsingEnzymeAPI = mountedWithEnzymeComponent.text()

    expect(textFoundByUsingEnzymeAPI).toBe(expectedText)
  })

  it('should use a custom mount', () => {
    function mountUsingNativeBrowserAPI(component) {
      const rootNode = document.body.appendChild(document.createElement('div'))

      render(component, rootNode)

      return rootNode
    }

    configureMocks({ mount: mountUsingNativeBrowserAPI })
    const expectedText = 'Foo'
    const mountedWithNativeBrowserAPIComponent = wrap(MyComponent).mount()

    const textFoundByUsingNativeBrowserAPI = mountedWithNativeBrowserAPIComponent.textContent

    expect(textFoundByUsingNativeBrowserAPI).toBe(expectedText)
  })
})