# mo.library.burrito
🌯 Wrap you tests so that you can test both behaviour and components with less effort.

## Motivation
As we are more focused on user interactions than implementation details. In order to test all the user interations that can be done at a certain point of our app, the upper the component we render in the test, the better.

## The idea
As we test our app we will be in two different scenarios where:
- We will need to test that the user interactions cause the proper side effects such as making http calls or refreshing the UI.
- In case we have a components library, we will need to test these by passing the needed props and checking that it returns (renders) the expected result.

In general, if you want to test behaviour, you need to simulate external actions from user or from http responses.
Most of the existing testing libraries give you control of the user actions and thats why we just ask you to set in the config what is the `render` function of your testing library.
Unfortunately, there aren't so many options when it comes to manage http requests and responses in the tests.
To give the mounted component context about which path is the current path where the app should be mounted, what props does the component receive, what http requests will respond with which results or where should the portal be mounted we have used the builder pattern that makes tests much more semantic.

## Installing
Using npm:

```
$ npm install @mercadona/mo.library.burrito --registry http://verdaccio.sta.monline
```

## Basic usage
```
const MyComponent = () => <span>Just a component</span>

const myWrappedComponent = wrap(MyComponent).mount()
```

## Initial setup
Because `burrito` doens't want to know anything about how the components are mounted in the project that uses it, we can specify how we will `mount` our components by passing the rendering/mounting function of our library of preference. This way we make `burrito` a litle bit more agnostic. For example `setup.burrito.js`

```
import { render } from '@testing-library/react'
import { configure } from '@mercadona/mo.library.burrito'

configure({
  mount: render,
})
```

and add the previous file in `jest.config.json`

```
  "setupFiles": [
    "<rootDir>/config/jest/setup.burrito.js"
  ],
```

## Builder API
#### withMocks
By using this you let your components know what `http requests` will respond. It works matching the request url which is `host` + `path`, the request `method` and the `requestBody`. All three need to match, otherwise it will raise an exception to let you know that one of your components is doing an `http request` that is not being handled.
```
import { wrap } from '@mercadona/mo.library.burrito'

const responses = {
  host: 'my-host',
  method: 'get',
  path: '/path/to/get/a/single/product/,
  responseBody: { id: 1, name: 'hummus' },
  status: 200,
  catchParams: true,
}

wrap(MyComponent)
  .withMocks(responses)
  .mount()
```
`host`, `method` and `status` will be the same most of the cases, we don't want to specify them every single time.

By default burrito 🌯 ignore the query params in your responses, but if you want to test it you can use the `catchParams` property in the request, like this:

```
wrap(MyComponentUsingQueryParams)
    .withMocks({
        path: '/path/with/query/params/?myAwesome=param',
        responseBody: '15',
        catchParams: true,
      })
    .mount()
```

While `host` has a default value specified by using the `configure`:
```
import { configure } from '@mercadona/mo.library.burrito'

const { API_HOST, API_VERSION } = process.env
configure({ defaultHost: `${ API_HOST }${ API_VERSION }` })
```
`method` as a default value of `'get'` and `status` is `200`. This means one can use `withMocks` like this:
```
import { wrap } from '@mercadona/mo.library.burrito'

const responses = {
  path: '/path/to/get/a/single/product/,
  responseBody: { id: 1, name: 'hummus' },
}

wrap(MyComponent)
  .withMocks(responses)
  .mount()
```
Now, you might need to mock several `http responses` at the same time and that's why you can also pass an array of responses instead if you wish:
```
import { wrap } from '@mercadona/mo.library.burrito'

const responses = [
  {
    path: '/path/to/get/the/products/list/,
    responseBody: [
      { id: 1, name: 'hummus' },
      { id: 2, name: 'guacamole' },
    ]
  },
  {
    path: '/path/to/get/a/single/product/,
    responseBody: { id: 1, name: 'hummus' },
  },
]

wrap(MyComponent)
  .withMocks(responses)
  .mount()
```

There might be cases where one request is called several times and we want it to return different responses. An example of this could be an app that shows a list of products that may be updated over time and for this puporse the app has a refresh button that will request the list again in order to update its content.

Well, it can be solved by specifying the response as multiple using `multipleResponse` as follows:

```
const responses = {
  path: '/path/to/get/the/products/list/,
  multipleResponses: [
  {
    responseBody: [
      { id: 1, name: 'hummus' },
      { id: 2, name: 'guacamole' },
    ]
  },
  {
    responseBody: [
      { id: 1, name: 'hummus' },
      { id: 2, name: 'guacamole' },
      { id: 3, name: 'peanut butter' },
    ]
   },
  ],
}
```

`multipleResponses` receives an array of responses where one set the `responseBody`, `status` or `headers` for every response.

When `multipleResponses` is present, `burrito` will ignore the `responseBody` at the root of the mock and will return one response per request made at the same time that sets the returned response as `hasBeenReturned`, which means it can be returned again, until all the array of responses is returned. In that case an exception will be raised.

This behaviour differs from using a single response for a given request as single response for a given request will return the response no matter how many times the request is called.

#### atPath
When mounting the whole app, it will be done at the default route passing the default path. But a specific route might need to be mounted and for that reason a path to match that route should be pass here.
```
import { wrap } from '@mercadona/mo.library.burrito'

wrap(MyComponent)
  .atPath(`/the/path/to/match/a/route/that/mounts/my/component/3`)
  .mount()
```

#### withProps
Pass down the props to the wrapped component:
```
import { wrap } from '@mercadona/mo.library.burrito'

const props = { message: 'MyComponent will receive this as prop' }

wrap(MyComponent)
  .withProps(props)
  .mount()
```

#### withPortalAt
If one or more of your components use a `react portal` in any way, you will need to specify the `id` of the node where it will be added:
```
import { wrap } from '@mercadona/mo.library.burrito'

wrap(PreparationContainer)
  .withPortalAt('modal-root')
  .mount()
```

#### composing
As it is basically a builder, all the above functions can be used at the same time and these will be composed underneath:
```
import { wrap } from '@mercadona/mo.library.burrito'

const props = { message: 'MyComponent will receive this as prop' }
const responses = {
  path: '/path/to/get/a/single/product/by/id/1/,
  responseBody: { id: 1, name: 'hummus' },
}

wrap(PreparationContainer)
  .atPath('/products/1')
  .withMocks(responses)
  .withProps()
  .withPortalAt('modal-root')
  .mount()
```

## Utils
#### toMatchNetWorkRequests
When mounting a component that does http calls, it might be useful to check if these requests are matching the mocks we are passing in the test. To do so, it will be necessary to use `expect.extend()` from `jest`:
```
import { wrap, assertions } from '@mercadona/mo.library.burrito'

expect.extend(assertions)

const responses = [
  { path: '/path/to/get/quantity/', responseBody: '15' },
  { path: '/path/to/endpoint/not/being/used/', responseBody: { value: 'I am not being used' } },
]

wrap(MyComponentMakingHttpCalls)
    .withMocks(responses)
    .mount()

expect(responses).toMatchNetworkRequests()
```

As there's an http request that is mocked but is not gonna be used in the code, it will make the test fail and log all the requests that are mocked but not being used in the code.
In the other hand, it can be used to do the oposite, there could be that a reqeust is being done in the code, but not being mocked in the tests.
