# mo.library.burrito
🌯 Yummy React tests with less effort.

## Motivation
As we embrace outside-in testing, we are more focused on user interactions than implementation details. In order to test all the user interations that can be done at a certain point of our app, the upper the component we render in the test, the better.

## The problem
Rendering the uppest component in the tree might cause dependency and boilerplate problems such as:
- At some point of the tree we need to access the `redux's store`
- We are likely need params from the url and for that purpose we need to know about the `routing`.
- What if we need to check that a button makes the user navigate to other page which actually renders another entire and different tree.
- In most of the cases, there will be http responses that will populate the state of our component (whatever it is), and we will need to mock them all.

## The idea
To solve the above problems we need a tool that:
- Mounts/renders the component by using a testing library passing the needed props and dependencies.
- Simplifies and reduces the boilerplate needed to mock the `redux's store` and `state`, the http responses and the `react-router state` and `navigation`.
To acomplish this, we have used the builder pattern that makes tests much more semantic.

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
In order to make easier the usage of `withMocks` and `withStore`, we can set default values to our `api host`, the initial `redux's store state` and the `reducers`. This way we make `burrito` a litle bit more agnostic. For example `setupMocks.js`

```
import { configureMocks } from '@mercadona/mo.library.burrito'
import reducers from 'src/reducers'

const { API_HOST, API_VERSION } = process.env
const initialState = { isAuth: false }

configureMocks({
  defaultHost: `${ API_HOST }${ API_VERSION }`,
  defaultStore: initialState,
  reducers,
})
```

Because `burrito` doens't want to know anything about how the components are mounted in the project that uses it, we can also specify how we will `mount` our components by passing the rendering/mounting function of our library of preference:

```
import { render } from '@testing-library/react'
import { configureMocks } from '@mercadona/mo.library.burrito'

configureMocks({
  mount: render,
})
```

and add the previous file in `jest.config.json`

```
  "setupFiles": [
    "<rootDir>/config/jest/setupMocks.js"
  ],
```

## API
#### withStore
It makes your component (and all the component tree below) think that he can make use of the `redux's store` and it will have the `defaultStore` as initial state.
```
import { wrap } from '@mercadona/mo.library.burrito'

wrap(MyComponent)
  .withStore()
  .mount()
```
It will work for most of the cases, but at some point one could need to recreate an specific scenario. You can do this by passing a custom initial state as parameter:
```
import { wrap } from '@mercadona/mo.library.burrito'

const myCustomInitialState = { isAuth: true }

wrap(MyComponent)
  .withStore(myCustomInitialState)
  .mount()
```

#### withRouter
It makes your component think that he is within a router and have access to `location`, `history` and `match`.
```
import { wrap } from '@mercadona/mo.library.burrito'

wrap(MyComponent)
  .withRouter()
  .mount()
```

There might be cases where an specific component makes (for example) an `http request`  depending on an specific route parameter. You can set route params by specific the `currentRoute`:
```
import { wrap } from '@mercadona/mo.library.burrito'
import { routes } from 'src/routes'

const routing = {
  currentRoute: {
    exact: routes.productDetail.exact, // true
    path: routes.productDetail.path, // '/products/:productId'
    route: '/products/5',
  },
}

wrap(MyComponent)
  .withStore(routing)
  .mount()
```
In the other hand, what if we want to test that after adding our product to the cart we click on the `confirm and checkout` button? We would need to test nativation between routes. We can actually do this by adding `otherRoutes`, which will be the routes where you will be navigating in your test:
```
import { wrap } from '@mercadona/mo.library.burrito'
import { routes } from 'src/routes'

const routing = {
  currentRoute: {
    exact: routes.productDetail.exact, // true
    path: routes.productDetail.path, // '/products/:productId'
    route: '/products/5',
  },
  otherRoutes: [
    routes.checkout, // { exact: true, path: '/checkout', component: MyCheckoutComponent }
  ]
}

wrap(MyComponent)
  .withStore(routing)
  .mount()
```

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
}

wrap(MyComponent)
  .withMocks(responses)
  .mount()
```
`host`, `method` and `status` will be the same most of the cases, we don't want to specify them every single time.

While `host` has a default value specified by using the `configureMocks`:
```
import { configureMocks } from '@mercadona/mo.library.burrito'

const { API_HOST, API_VERSION } = process.env
configureMocks({ defaultHost: `${ API_HOST }${ API_VERSION }` })
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
  multipleResponse: [
    responseBody: [
      { id: 1, name: 'hummus' },
      { id: 2, name: 'guacamole' },
    ],
    responseBody: [
      { id: 1, name: 'hummus' },
      { id: 2, name: 'guacamole' },
      { id: 3, name: 'peanut butter' },
    ]
  ],
}
```

`multipleResponses` receives an array of responses where one set the `responseBody`, `status` or `headers` for every response.

When `multipleResponses` is present, `burrito` will ignore the `responseBody` at the root of the mock and will return one response per request made at the same time that sets the returned response as `hasBeenReturned`, which means it can be returned again, until all the array of responses is returned. In that case an exception will be raised.

This behaviour differs from using a single response for a given request as single response for a given request will return the response no matter how many times the request is called.

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
If one or more of your components use a `react portal` in any way, you will need to specify the `id` of node where it will be added:
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
  path: '/path/to/get/a/single/product/,
  responseBody: { id: 1, name: 'hummus' },
}

wrap(PreparationContainer)
  .withProps()
  .withPortalAt('modal-root')
  .withStore()
  .withRouter()
  .withMocks(responses)
  .mount()
```
