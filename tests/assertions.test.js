import { render, wait } from '@testing-library/react'

import { wrap, assertions, configureMocks } from '../src'
import { MyComponentMakingHttpCalls } from './components.mock'
import { mockedResponses } from '../src/notUtilizedResponses'

expect.extend(assertions)

configureMocks({ defaultHost: 'my-host', mount: render })

it('should match network requests  when all the responses are being used', async () => {
  wrap(MyComponentMakingHttpCalls)
    .withMocks({ path: '/path/to/get/quantity/', responseBody: '15' })
    .mount()

  await wait(() => {
    const { pass, message } = assertions.toMatchNetworkRequests(mockedResponses)
    expect(pass).toBeTruthy()
    expect(message()).toBeUndefined()
    expect(mockedResponses).toMatchNetworkRequests()
  })
})

it('should not match network requests when passing mocks not being used', async () => {
  wrap(MyComponentMakingHttpCalls)
    .withMocks([
      { path: '/path/to/get/quantity/', responseBody: '15' },
      { path: '/path/to/endpoint/not/being/used/', responseBody: { value: 'I am not being used' } },
    ])
    .mount()

  await wait(() => {
    const { pass, message } = assertions.toMatchNetworkRequests(mockedResponses)
    expect(pass).toBeFalsy()
    expect(message()).toContain('Expected to match the network requests but found mocked responses not being used:')
    expect(message()).toContain('+   Object {')
    expect(message()).toContain('+     "path": "/path/to/endpoint/not/being/used/",')
    expect(message()).toContain('+     "responseBody": Object {')
    expect(message()).toContain('+       "value": "I am not being used",')
    expect(message()).toContain('+     },')
    expect(message()).toContain('+   },')
    expect(mockedResponses).not.toMatchNetworkRequests()
  })
})

it('should match network requests when all the multiple responses are being used', async () => {
  wrap(MyComponentMakingHttpCalls)
    .withMocks({ path: '/path/to/get/quantity/', multipleResponses: [
      { responseBody: '15' },
    ]})
    .mount()

  await wait(() => {
    const { pass, message } = assertions.toMatchNetworkRequests(mockedResponses)
    expect(pass).toBeTruthy()
    expect(message()).toBeUndefined()
    expect(mockedResponses).toMatchNetworkRequests()
  })
})

it('should not match network requests when at least one multiple response is not being used', async () => {
  wrap(MyComponentMakingHttpCalls)
    .withMocks({ path: '/path/to/get/quantity/', multipleResponses: [
      { responseBody: '15' },
      { responseBody: { value: 'I am not being used' } },
    ]})
    .mount()

  await wait(() => {
    const { pass, message } = assertions.toMatchNetworkRequests(mockedResponses)
    expect(pass).toBeFalsy()
    expect(message()).toContain('Expected to match the network requests but found mocked responses not being used:')
    expect(message()).toContain('+       Object {')
    expect(message()).toContain('+         "responseBody": Object {')
    expect(message()).toContain('+           "value": "I am not being used",')
    expect(message()).toContain('+         },')
    expect(message()).toContain('+       },')
    expect(mockedResponses).not.toMatchNetworkRequests()
  })
})