import { render, wait, fireEvent } from '@testing-library/react'

import { wrap, assertions, configure } from '../src'
import { MyComponentMakingHttpCalls, MyComponentRepeatingHttpCalls } from './components.mock'
import { refreshProductsList, getTableRowsText } from './helpers'

expect.extend(assertions)

configure({ defaultHost: 'my-host', mount: render })

afterEach(jest.restoreAllMocks)

it('should match network requests when all the responses are being used', async () => {
  const responses = { path: '/path/to/get/quantity/', responseBody: '15' }
  wrap(MyComponentMakingHttpCalls)
    .withMocks(responses)
    .mount()

  await wait(() => {
    const { pass, message } = assertions.toMatchNetworkRequests(responses)
    expect(pass).toBeTruthy()
    expect(message()).toBeUndefined()
    expect(responses).toMatchNetworkRequests()
  })
})

it('should not match network requests when passing mocks not being used', async () => {
  const responses = [
    { path: '/path/to/get/quantity/', responseBody: '15' },
    { path: '/path/to/endpoint/not/being/used/', responseBody: { value: 'I am not being used' } },
  ]
  wrap(MyComponentMakingHttpCalls)
    .withMocks(responses)
    .mount()

  await wait(() => {
    const { pass, message } = assertions.toMatchNetworkRequests(responses)
    expect(pass).toBeFalsy()
    expect(message())
      .toContain('Expected mocked responses to match the network requests but found mocked responses not being used:')
    expect(message()).toContain('  Object {')
    expect(message()).toContain('    "path": "/path/to/endpoint/not/being/used/",')
    expect(message()).toContain('    "responseBody": Object {')
    expect(message()).toContain('      "value": "I am not being used",')
    expect(message()).toContain('    },')
    expect(message()).toContain('  },')
    expect(responses).not.toMatchNetworkRequests()
  })
})

it('should match network requests when all the multiple responses are being used', async () => {
  const responses = { path: '/path/to/get/quantity/', multipleResponses: [
    { responseBody: '15' },
  ]}
  wrap(MyComponentMakingHttpCalls)
    .withMocks(responses)
    .mount()

  await wait(() => {
    const { pass, message } = assertions.toMatchNetworkRequests(responses)
    expect(pass).toBeTruthy()
    expect(message()).toBeUndefined()
    expect(responses).toMatchNetworkRequests()
  })
})

it('should not match network requests when at least one multiple response is not being used', async () => {
  const responses = { path: '/path/to/get/quantity/', multipleResponses: [
    { responseBody: '15' },
    { responseBody: { value: 'I am not being used' } },
  ]}
  wrap(MyComponentMakingHttpCalls)
    .withMocks(responses)
    .mount()

  await wait(() => {
    const { pass, message } = assertions.toMatchNetworkRequests(responses)
    expect(pass).toBeFalsy()
    expect(message())
      .toContain('Expected mocked responses to match the network requests but found mocked responses not being used:')
    expect(message()).toContain('    Object {')
    expect(message()).toContain('      "responseBody": Object {')
    expect(message()).toContain('        "value": "I am not being used",')
    expect(message()).toContain('      },')
    expect(message()).toContain('    },')
    expect(responses).not.toMatchNetworkRequests()
  })
})

it('should not match network requests when missing responses for a given request', async () => {
  console.warn = jest.fn()
  const responses = { path: '/path/to/wrong/endpoint/', responseBody: { value: 'I will not be returned' } }
  wrap(MyComponentMakingHttpCalls)
    .withMocks(responses)
    .mount()

  await wait(() => {
    const { pass, message } = assertions.toMatchNetworkRequests(responses)
    expect(pass).toBeFalsy()
    expect(message())
      .toContain('Expected mocked responses to match the network requests but there are requests missing a mocked response:')
    expect(message()).toContain('  Object {')
    expect(message()).toContain('    "method": "get",')
    expect(message()).toContain('    "requestBody": null,')
    expect(message()).toContain('    "url": "my-host/path/to/get/quantity/",')
    expect(message()).toContain('  },')
    expect(responses).not.toMatchNetworkRequests()
  })
})

it('should not match network requests when all multiple responses have been returned already', async () => {
  console.warn = jest.fn()
  const products = ['tomato', 'orange']
  const responses = {
    path: '/path/to/get/products/',
    multipleResponses: [
      { responseBody: products },
    ],
  }
  const { container } = wrap(MyComponentRepeatingHttpCalls)
    .withMocks(responses)
    .mount()

  refreshProductsList(container)
  await wait(() => expect(getTableRowsText(container)).toEqual(products))

  refreshProductsList(container)
  await wait(() => {
    const { pass, message } = assertions.toMatchNetworkRequests(responses)
    expect(pass).toBeFalsy()
    expect(message())
      .toContain('Expected mocked responses to match the network requests but there are requests missing a mocked response:')
    expect(message()).toContain('  Object {')
    expect(message()).toContain('    "method": "get",')
    expect(message()).toContain('    "requestBody": null,')
    expect(message()).toContain('    "url": "my-host/path/to/get/products/",')
    expect(message()).toContain('  },')
    expect(responses).not.toMatchNetworkRequests()
  })
})

it('should match network requests even when these have different sorting', async () => {
  const responses = [
    { method: 'post', path: '/path/to/save/quantity/', requestBody: { quantity: '15' } },
    { path: '/path/to/get/quantity/', responseBody: '15' },
  ]
  const { getByText } = wrap(MyComponentMakingHttpCalls)
    .withMocks(responses)
    .mount()

  await wait(() => fireEvent.click(getByText('quantity: 15')))

  await wait(() => {
    expect(responses).toMatchNetworkRequests()
  })
})