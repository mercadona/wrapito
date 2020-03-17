import React, { Component, Fragment, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSelector } from 'react-redux'
import { Router, Switch, Route } from 'react-router-dom'
import { createBrowserHistory } from 'history'

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

export const MyComponentWithStore = () => {
  const session = useSelector(state => state.session)

  if (!session || !session.isAuth) {
    return <p>Please, login</p>
  }

  return <p>Hello { session.user }</p>
}

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

const Home = () => <div>Home</div>
const Categories = () => <div>Categories</div>

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