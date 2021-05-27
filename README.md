# 🌯 mo.library.burrito
Wrap you tests so that you can test both behaviour and components with less effort.

## 🎯 Motivation
As we are more focused on user interactions than implementation details. In order to test all the user interactions that can be done at a certain point of our app, the upper the component we render in the test, the better.

## 💡 The idea
As we test our app we will be in two different scenarios where:
- We will need to test that the user interactions cause the proper side effects such as making http calls or refreshing the UI.
- In case we have a components library, we will need to test these by passing the needed props and checking that it returns (renders) the expected result.

In general, if you want to test behaviour, you need to simulate external actions from user or from http responses.
Most of the existing testing libraries give you control of the user actions and thats why we just ask you to set in the config what is the `render` function of your testing library.
Unfortunately, there aren't so many options when it comes to manage http requests and responses in the tests.
To give the mounted component context about which path is the current path where the app should be mounted, what props does the component receive, what http requests will respond with which results or where should the portal be mounted we have used the builder pattern that makes tests much more semantic.

## 🔧 Installing
Using npm:

```
$ npm install @mercadona/mo.library.burrito --registry http://verdaccio.sta.monline
```

## 👩‍💻 Basic usage
```
const MyComponent = () => <span>Just a component</span>

const myWrappedComponent = wrap(MyComponent).mount()
```

## 👣 Initial setup
Because 🌯 `burrito` doesn't want to know anything about how the components are mounted in the project that uses it, we can specify how we will `mount` our components by passing the rendering/mounting function of our library of preference. This way we make `burrito` a little bit more agnostic. For example `setup.burrito.js`

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

If one or more of your components use a `react portal` in any way, you will need to specify the `id` of the node where it will be added:

```
import { render } from '@testing-library/react'
import { configure } from '@mercadona/mo.library.burrito'

configure({
  mount: render,
  portal: 'modal-root',
})
```

## 🏰 Builder API

#### withMocks (Deprecated)

It has the same API than the withNetwork builder. The main difference between them is that withMocks will fail if a given request, done by the production code, is not set up in the `responses object`.

#### withNetwork
By using this feature you can configure the responses for your `http requests`. If your component is making a request that is not set up in the `responses object`, it will not be validated and it will return an empty response with code 200.

```
import { wrap } from '@mercadona/mo.library.burrito'

const responses = {
  host: 'my-host',
  method: 'get',
  path: '/path/to/get/a/single/product/,
  responseBody: { id: 1, name: 'hummus' },
  status: 200,
  catchParams: true,
  delay: 500,
}

wrap(MyComponent)
  .withNetwork(responses)
  .mount()
```

You can specify the default `host` via configuration:
```
import { configure } from '@mercadona/mo.library.burrito'

const { API_HOST, API_VERSION } = process.env
configure({ defaultHost: `${ API_HOST }${ API_VERSION }` })
```
In addition, `burrito` defaults the `method` to `'get'` and `status` to `200`. This means one can use `withNetwork` like this:
```
import { wrap } from '@mercadona/mo.library.burrito'

const responses = {
  path: '/path/to/get/a/single/product/,
  responseBody: { id: 1, name: 'hummus' },
}

wrap(MyComponent)
  .withNetwork(responses)
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
  .withNetwork(responses)
  .mount()
```

There might be cases where one request is called several times and we want it to return different responses. An example of this could be an app that shows a list of products that may be updated over time and for this propose the app has a refresh button that will request the list again in order to update its content.

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

When `multipleResponses` is present, 🌯 `burrito` will ignore the `responseBody` at the root of the mock and will return one response per request made at the same time that sets the returned response as `hasBeenReturned`, which means it can be returned again, until all the array of responses is returned. In that case an exception will be raised.

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
  .withNetwork(responses)
  .withProps()
  .mount()
```

## ✨ Utils
#### toHaveBeenFetched
Some times checking only the visual side effects in the UI it's not enough. In the case that we want to check if a particular network side effect is happening, this assertion will come in handy.

```
  wrap(MyComponentMakingHttpCalls)
  .withNetwork(responses)
  .mount()

  expect('/some/path').toHaveBeenFetched()
```

#### toHaveBeenFetchedWith
This assertion is an extension of `toHaveBeenFetched` but we will use it if we want to check the properties.
```
import { wrap, assertions } from '@mercadona/mo.library.burrito'

wrap(MyComponentMakingHttpCalls)
    .withNetwork(responses)
    .mount()

expect('/some/path').toHaveBeenFetchedWith({
  method: 'POST',
  body: { key: 'value' },
})
```

#### toHaveBeenFetchedTimes
This assertion is to check how many times an API url is called.
```
import { wrap, assertions } from '@mercadona/mo.library.burrito'

expect.extend(assertions)

const responses = [
  { path: '/path/to/get/quantity/' },
]

wrap(MyComponentMakingHttpCalls)
    .withNetwork(responses)
    .mount()

expect('/path/to/get/quantity/').toHaveBeenFetchedTimes(1)
```

## 🔧 Development

In order to test the library in a project without releasing the library:

- ```npm run build```
- This will generate a local build in the `dist` folder
- Copy the content of that folder in `node_modules/@mercadona/mo.library.burrito` in your project
