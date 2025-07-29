import React, { Component, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { BrowserRouter, Route, Router, Switch, useLocation } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'

export const MyComponent = () => <div>Foo</div>

export const MyComponentWithProps = props => (
  <div>{props && Object.entries(props).map(prop => prop)}</div>
)

export const MyComponentWithPortal = ({ children }) =>
  createPortal(children, document.getElementById('portal-root-id'))

export class MyComponentMakingHttpCalls extends Component {
  state = {
    quantity: 0,
    isSaved: false,
  }

  componentDidMount = async () => {
    const request = new Request('my-host/path/to/get/quantity/')
    const quantityResponse = await fetch(request)
    if (!quantityResponse) return
    if (quantityResponse.status !== 200) {
      this.setState({ quantity: 'error' })
      return
    }
    const quantity = await quantityResponse.json()

    this.setState({ quantity })
  }

  saveQuantity = async () => {
    const request = new Request('my-host/path/to/save/quantity/', {
      method: 'POST',
      body: JSON.stringify({ quantity: this.state.quantity }),
    })
    try {
      await fetch(request)
      this.setState({ isSaved: true })
    } catch (e) {
      this.setState({ isSaved: false })
    }
  }

  render = () => (
    <div data-testid="quantity" onClick={this.saveQuantity}>
      <span>quantity: {this.state.quantity}</span>
      {this.state.isSaved && <i aria-label="quantity saved" />}
    </div>
  )
}

export const myFakeModule = {
  myFakeFunction: () => null,
}

const Home = ({ history }) => {
  const goToCategories = () => history.push('/categories')
  myFakeModule.myFakeFunction('HOME')
  return (
    <div>
      Home
      <button onClick={goToCategories}>Go to categories</button>
    </div>
  )
}
const Categories = () => {
  return <div>Categories</div>
}

const PageUsingLocationState = () => {
  const [title, setTitle] = useState()
  const location = useLocation()

  useEffect(() => {
    if (location.state) setTitle(location.state.title)
  }, [location.state])

  return <div>{title}</div>
}

export const history = createBrowserHistory()

export const MyAppWithRouting = () => {
  return (
    <Router history={history}>
      <Switch>
        <Route key="home" path="/" component={Home} exact={true} />
        <Route
          key="categories"
          path="/categories"
          component={Categories}
          exact={true}
        />
        <Route
          component={PageUsingLocationState}
          key="page-using-location-state"
          path="/page-using-location-state"
          exact={true}
        />
      </Switch>
    </Router>
  )
}

export const MyAppWithBrowserRouting = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route key="home" path="/" component={Home} exact={true} />
        <Route
          key="categories"
          path="/categories"
          component={Categories}
          exact={true}
        />
      </Switch>
    </BrowserRouter>
  )
}

const ACTION_TYPES = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
}

const add = () => ({ type: ACTION_TYPES.ADD })
const remove = () => dispatch => dispatch({ type: ACTION_TYPES.REMOVE })

function reducer(state = { products: 10 }, action) {
  switch (action.type) {
    case ACTION_TYPES.ADD:
      return {
        products: state.products + 1,
      }

    case ACTION_TYPES.REMOVE:
      return {
        products: state.products - 1,
      }

    default:
      return state
  }
}

const Cart = () => {
  const { products } = useSelector(state => state)
  const dispatch = useDispatch()

  return (
    <div>
      <p>{products}</p>
      <button onClick={() => dispatch(add())}>+</button>
      <button onClick={() => dispatch(remove())}>-</button>
    </div>
  )
}

export const MyAppWithStore = () => {
  return (
    <Provider
      store={createStore(reducer, { products: 10 }, applyMiddleware(thunk))}
    >
      <Cart />
    </Provider>
  )
}

export const MyComponentMakingHttpCallsWithQueryParams = () => {
  const [quantity, setQuantity] = useState(0)

  useEffect(() => {
    getQuantity()
  }, [])

  const getQuantity = async () => {
    const request = new Request('/path/with/query/params/?myAwesome=param')
    const response = await fetch(request)
    if (!response) return
    const quantity = await response.json()

    setQuantity(quantity)
  }

  return <span>quantity: {quantity}</span>
}

export const MyComponentWithNetwork = () => {
  const [status, setStatus] = useState(null)
  const [quantity, setQuantity] = useState(null)

  useEffect(() => {
    doRequest()
    doRequestWithResponse()
  }, [])

  const doRequest = async () => {
    const request = new Request('my-host/path/')
    const response = await fetch(request)
    if (response) {
      setStatus('SUCCESS')
    }
  }

  const doRequestWithResponse = async () => {
    const request = new Request('my-host/path/with/response/')
    const response = await fetch(request)
    const quantity = await response.json()
    setQuantity(quantity)
  }

  return (
    <div>
      <div>MyComponentWithNetwork</div>
      <div>{status}</div>
      <div>{quantity}</div>
    </div>
  )
}

export const MyComponentWithLogin = () => {
  const [username, setUser] = useState(null)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    login()
  }, [])

  const login = async () => {
    const request = new Request('my-host/path/to/login/', { method: 'POST' })
    const response = await fetch(request)
    const username = await response.json()
    setUser(username)
    setStatus('LOGIN')
  }

  const logout = async () => {
    const request = new Request('my-host/path/to/logout/', { method: 'POST' })
    const response = await fetch(request)
    const username = await response.json()
    setUser(username)
    setStatus('LOGOUT')
  }

  if (status === 'LOGIN') {
    return (
      <div>
        <span>Logged in as {username}</span>
        <button onClick={logout}>Logout</button>
      </div>
    )
  }
  if (status === 'LOGOUT') return <span>Logged out as {username}</span>
  return <span>Not logged</span>
}

export const MyComponentWithPost = () => {
  const [username, setUser] = useState(null)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    login()
  }, [])

  const login = async () => {
    const request = new Request('my-host/path/to/login/', {
      method: 'POST',
      body: JSON.stringify({
        bar: 'bar',
        foo: 'foo',
        user: {
          username: 'Fran',
          password: 'secret',
        },
      }),
    })
    const response = await fetch(request)
    const username = await response.json()
    setUser(username)
    setStatus('LOGIN')
  }

  if (status === 'LOGIN') {
    return <span>Logged in as {username}</span>
  }

  return <span>Not logged</span>
}

export const MyComponentWithFeedback = () => {
  const [feedback, setFeedback] = useState('DEFAULT')

  const save = async () => {
    const request = new Request('my-host/path/to/save/', {
      method: 'POST',
    })

    const response = await fetch(request)
    if (!response) return
    const { name } = await response.json()
    setFeedback(name)
  }

  return (
    <div>
      <button onClick={save}>save</button>
      <span>{feedback}</span>
    </div>
  )
}

export const GreetingComponent = () => {
  const [name, setName] = useState('')

  useEffect(() => {
    async function fetchData() {
      await fetch(
        new Request('my-host/request1', {
          method: 'POST',
          body: JSON.stringify({ id: 1 }),
        }),
      )

      const response = await fetch(
        new Request('my-host/request2', {
          method: 'POST',
          body: JSON.stringify({ id: 2 }),
        }),
      )
      const data = await response.json()
      setName(data?.name)
    }

    fetchData()
  }, [])

  return <div>Hi {name}!</div>
}
