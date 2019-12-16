import { render, wait, fireEvent } from '@testing-library/react'
import { wrap, configureMocks } from '../src/index'
import { MyComponentMakingHttpCalls, MyComponentRepeatingHttpCalls, } from './components.mock'
import { refreshProductsList, getTableRowsText } from './helpers'
import { getMocksConfig } from '../src/config'

const defaultMocksConfig = getMocksConfig()

function resetMocksConfig() {
  configureMocks(defaultMocksConfig)
  jest.restoreAllMocks()
}

afterEach(resetMocksConfig)

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