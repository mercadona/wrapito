import React, { Component, Fragment, useState } from 'react'
import { createPortal } from 'react-dom'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { Router, Switch, Route } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

export const MyComponent = () => <div>Foo</div>

export const MyComponentWithProps = props => (
  <div>
    { props &&
      Object.entries(props).map(prop => prop)
    }
  </div>
)

export const MyComponentWithPortal = ({ children }) => (
  createPortal(children, document.getElementById('portal-root-id'))
)

export const MyComponentWithRouter = ({ match }) => {
  return <p>Current route: "{ match.url }"</p>
}

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
    <div data-testid="quantity" onClick={ this.saveQuantity }>
      <span>quantity: { this.state.quantity }</span>
      { this.state.isSaved && <i aria-label="quantity saved" /> }
    </div>
  )
}

export const MyComponentRepeatingHttpCalls = () => {
  const [ products, setProducts ] = useState([])

  const fetchProducts = async () => {
    const productsRequest = new Request('my-host/path/to/get/products/')
    try {
      const productsResponse = await fetch(productsRequest)
      const products = await productsResponse.json()
      setProducts(products)
    } catch (error) {}
  }

  return (
    <Fragment>
      <button onClick={ fetchProducts }>refresh products list</button>
      <table>
        <tbody>
          { products.map(product => (
              <tr key={ product }>
                <td>{ product }</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </Fragment>
  )
}

export const myFakeModule = {
  myFakeFunction: () => null
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
  return (
    <div>Categories</div>
  )
}

export const history = createBrowserHistory()

export const MyAppWithRouting = () => {
  return (
    <Router history={ history }>
      <Switch>
        <Route key="home" path="/" component={Home} exact={true} />
        <Route key="categories" path="/categories" component={Categories} exact={true} />
      </Switch>
    </Router>
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
      <p>{ products }</p>
      <button onClick={() => dispatch(add())}>+</button>
      <button onClick={() => dispatch(remove())}>-</button>
    </div>
  )
}

export const MyAppWithStore = () => {
  return (
    <Provider store={ createStore(reducer, { products: 10 }, applyMiddleware(thunk)) }>
      <Cart/>
    </Provider>
  )
}