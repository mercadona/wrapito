# 🌯 wrapito

Wrap you tests so that you can test both behaviour and components with less effort.

## IMPORTANT

This version is agnostic and compatible with both [jest](https://jestjs.io/) and [vitest](https://vitest.dev/).

### Note:

From the version 13 wrapito is compatible with the new version of React and requires such versions of dependencies:

```
"peerDependencies": {
    "@testing-library/jest-dom": ">=5.16.4",
    "@testing-library/react": ">=14.0.0",
    "react-dom": ">=18.0.0",
    "react": ">=18.0.0"
  }
```

If your project uses React <=18.0.0, you can use wrapito <=12, but we extremely recommend to migrate to newest versions,
because we are not maintaining legacy dependencies.

## 🎯 Motivation

As we are more focused on user interactions than implementation details. In order to test all the user interactions that
can be done at a certain point of our app, the upper the component we render in the test, the better.

## 💡 The idea

As we test our app we will be in two different scenarios where:

- We will need to test that the user interactions cause the proper side effects such as making http calls or refreshing
  the UI.
- In case we have a components library, we will need to test these by passing the needed props and checking that it
  returns (renders) the expected result.

In general, if you want to test behaviour, you need to simulate external actions from user or from http responses.
Unfortunately, there aren't so many options when it comes to manage http requests and responses in the tests.
To give the mounted component context about which path is the current path where the app should be mounted, what props
does the component receive, what http requests will respond with which results or where should the portal be mounted we
have used the builder pattern that makes tests much more semantic.

## 🔧 Installing

Using npm:

```sh
$ npm install wrapito
```

## 👩‍💻 Basic usage

```js
const MyComponent = () => <span>Just a component</span>

const myWrappedComponent = wrap(MyComponent).mount()
```

## 👣 Initial setup

In the latest version of 🌯 `wrapito` passing the rendering/mounting function is optional, because we use `render` from
`@testing-library/react` by default.

If one or more of your components use a `react portal` in any way, you will need to specify the `id` of the node where
it will be added.

To configure wrapito we recommend adding a setupTests.tsx file and adding there all your custom configs and extensions.

```js
import { configure } from 'wrapito'

configure({
  defaultHost: 'your-host-path',
  portal: 'modal-root',
  extend: {
    /* Here you can group network calls to reuse them in your tests */
  },
})
```

Add this line in your project setup (vite/cra):

```js
setupFiles: ['./src/setupTests.tsx']
```

## 🏰 Builder API

#### withNetwork

By using this feature you can configure the responses for your `http requests`. If your component is making a request
that is not set up in the `responses object`, it will not be validated and it will return an empty response with code
200.

```js
import { wrap } from 'wrapito'

const responses = {
  host: 'my-host',
  method: 'get',
  path: '/path/to/get/a/single/product/',
  responseBody: { id: 1, name: 'hummus' },
  status: 200,
  catchParams: true,
  delay: 500,
}

wrap(MyComponent).withNetwork(responses).mount()
```

You can specify the default `host` via configuration:

```js
import { configure } from 'wrapito'

const { API_HOST, API_VERSION } = process.env
configure({ defaultHost: `${API_HOST}${API_VERSION}` })
```

In addition, `wrapito` defaults the `method` to `'get'` and `status` to `200`. This means one can use `withNetwork` like
this:

```js
import { wrap } from 'wrapito'

const responses = {
  path: '/path/to/get/a/single/product/,
  responseBody: { id: 1, name: 'hummus' },
}

wrap(MyComponent)
  .withNetwork(responses)
  .mount()
```

Now, you might need to mock several `http responses` at the same time and that's why you can also pass an array of
responses instead if you wish:

```js
import { wrap } from 'wrapito'

const responses = [
  {
    path: '/path/to/get/the/products/list/',
    responseBody: [
      { id: 1, name: 'hummus' },
      { id: 2, name: 'guacamole' },
    ],
  },
  {
    path: '/path/to/get/a/single/product/',
    responseBody: { id: 1, name: 'hummus' },
  },
]

wrap(MyComponent).withNetwork(responses).mount()
```

There might be cases where one request is called several times and we want it to return different responses. An example
of this could be an app that shows a list of products that may be updated over time and for this propose the app has a
refresh button that will request the list again in order to update its content.

Well, it can be solved by specifying the response as multiple using `multipleResponse` as follows:

```js
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

`multipleResponses` receives an array of responses where one set the `responseBody`, `status` or `headers` for every
response.

When `multipleResponses` is present, 🌯 `wrapito` will ignore the `responseBody` at the root of the mock and will return
one response per request made at the same time that sets the returned response as `hasBeenReturned`, which means it can
be returned again, until all the array of responses is returned. In that case an exception will be raised.

This behaviour differs from using a single response for a given request as single response for a given request will
return the response no matter how many times the request is called.

#### atPath

When mounting the whole app, it will be done at the default route passing the default path. But a specific route might
need to be mounted and for that reason a path to match that route should be pass here.

```js
import { wrap } from 'wrapito'

wrap(MyComponent)
  .atPath(`/the/path/to/match/a/route/that/mounts/my/component/3`)
  .mount()
```

By default it will use the native javascript history API, but you can provide a method to be called for change the app
route with [`changeRoute`](#changeRoute):

```js
import { configure } from 'wrapito'
import { history } from 'app.js'

configure({
  ..configuration,
  changeRoute: (route) => history.push(route)
})
```

#### withProps

Pass down the props to the wrapped component:

```js
import { wrap } from 'wrapito'

const props = { message: 'MyComponent will receive this as prop' }

wrap(MyComponent).withProps(props).mount()
```

#### composing

As it is basically a builder, all the above functions can be used at the same time and these will be composed
underneath:

```js
import { wrap } from 'wrapito'

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

Some times checking only the visual side effects in the UI it's not enough. In the case that we want to check if a
particular network side effect is happening, this assertion will come in handy.

```js
wrap(MyComponentMakingHttpCalls).withNetwork(responses).mount()

expect('/some/path').toHaveBeenFetched()
```

#### toHaveBeenFetchedWith

This assertion is an extension of `toHaveBeenFetched` but we will use it if we want to check the properties.

```js
import { wrap, assertions } from 'wrapito'

wrap(MyComponentMakingHttpCalls).withNetwork(responses).mount()

expect('/some/path').toHaveBeenFetchedWith({
  method: 'POST',
  body: { key: 'value' },
})
```

#### toHaveBeenFetchedTimes

This assertion is to check how many times an API url is called.

```js
import { wrap, assertions } from 'wrapito'

expect.extend(assertions)

const responses = [{ path: '/path/to/get/quantity/' }]

wrap(MyComponentMakingHttpCalls).withNetwork(responses).mount()

expect('/path/to/get/quantity/').toHaveBeenFetchedTimes(1)
```

## 🔧 Development

In order to test the library in a project without releasing the library:

- `npm run build`
- This will generate a local build in the `dist` folder
- Copy the content of that folder in `node_modules/wrapito` in your project

## Deploy new version in npm

You need to create a new tag for the project. E.g:

```
git tag v1.0.5
git push origin v1.0.5
```

This will run a workflow in github that will publish this version for you.

### Release beta versions

WARNING: DO NOT MERGE YOUR PR IF YOU WANT TO DO A BETA RELEASE, SINCE THE CHANGES ARE NOT FULLY TRUSTED THEY SHOULD NOT
GO TO MASTER

If you need to release beta versions to test things, you may do so with the -beta tag. E.g:

```
git tag v1.0.5-beta1
git push origin v1.0.5-beta1
```

This will run a workflow in github that will publish this version for you as a pre-release.
