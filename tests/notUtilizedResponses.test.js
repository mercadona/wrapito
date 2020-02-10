import { render, wait, cleanup } from '@testing-library/react'
import { wrap, configureMocks, highlightNotUtilizedResponses } from '../src/index'
import { MyComponentMakingHttpCalls, MyComponentRepeatingHttpCalls } from './components.mock'
import { refreshProductsList } from './helpers'

configureMocks({ defaultHost: 'my-host', mount: render })

afterEach(() => {
  cleanup()
  jest.restoreAllMocks()
})

it('should warn when there are responses not being used', async () => {
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

  wrap(MyComponentMakingHttpCalls)
    .withMocks([
      { path: '/path/to/get/quantity/', responseBody: '15' },
      { path: '/path/to/endpoint/not/being/used/', responseBody: { value: 'I am not being used' } },
    ])
    .mount()

  await wait(() => {
    highlightNotUtilizedResponses()
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('the following responses are not being used:'))
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('/path/to/endpoint/not/being/used/'))
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('get'))
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('I am not being used'))
  })
})

it('should warn when there are multiple responses not being used', async () => {
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

  wrap(MyComponentMakingHttpCalls)
    .withMocks([
      { path: '/path/to/get/quantity/', responseBody: '15' },
      { path: '/path/to/endpoint/not/being/used/', multipleResponses: [
        { responseBody: { value: 'I will not be used' } },
        { responseBody: { value: 'Me neither' } },
      ]},
    ])
    .mount()

  await wait(() => {
    highlightNotUtilizedResponses()
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('the following responses are not being used:'))
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('/path/to/endpoint/not/being/used/'))
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('get'))
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('I will not be used'))
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('Me neither'))
  })
})

it('should warn when at least one of the multiple responses are not being used', async () => {
  const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()
  const productsBeforeRefreshing = ['tomato', 'orange']
  const productsAfterRefreshing = ['tomato', 'orange', 'apple']

  const { container } = wrap(MyComponentRepeatingHttpCalls)
    .withMocks({ path: '/path/to/get/products/', multipleResponses: [
      { responseBody: productsBeforeRefreshing },
      { responseBody: productsAfterRefreshing },
    ]},)
    .mount()

  refreshProductsList(container)

  await wait(() => {
    highlightNotUtilizedResponses()
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('the following responses are not being used:'))
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('/path/to/get/products/'))
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('get'))
    expect(consoleWarn).not.toHaveBeenCalledWith(expect.stringContaining(JSON.stringify(productsBeforeRefreshing)))
    expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining(JSON.stringify(productsAfterRefreshing)))
  })
})

it('should not warn when all the responses are being used', async () => {
  const consoleWarn = jest.spyOn(console, 'warn')

  wrap(MyComponentMakingHttpCalls)
    .withMocks({ path: '/path/to/get/quantity/', responseBody: '15' })
    .mount()

  await wait(() => {
    highlightNotUtilizedResponses()
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})

it('should not warn when all the multiple responses are being used', async () => {
  const consoleWarn = jest.spyOn(console, 'warn')
  const productsBeforeRefreshing = ['tomato', 'orange']

  const { container } = wrap(MyComponentRepeatingHttpCalls)
    .withMocks({ path: '/path/to/get/products/', multipleResponses: [
      { responseBody: productsBeforeRefreshing },
    ]},)
    .mount()

  refreshProductsList(container)

  await wait(() => {
    highlightNotUtilizedResponses()
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})