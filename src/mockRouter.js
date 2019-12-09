import React from 'react'
import { oneOfType, node, func, arrayOf, shape, string, boolean, object } from 'prop-types'
import { createMemoryHistory } from 'history'
import { Router, Switch, Route } from 'react-router-dom'

const mockRouter = ({ route = '/', history = createMemoryHistory({ initialEntries: [ route ] }) } = {}) => history

const MockRouter = ({ Component, routing = { otherRoutes: [], currentRoute: {} }, componentProps }) => (
  <Router history={ mockRouter(routing.currentRoute) }>
    <Switch>
      { routing.otherRoutes &&
        routing.otherRoutes.map(route => <Route key={ route.path } { ...route } />)
      }
      <Route
        { ...routing.currentRoute }
        render={ routeProps => <Component { ...componentProps } { ...routeProps } /> }
      />
    </Switch>
  </Router>
)

MockRouter.propTypes = {
  Component: oneOfType([func, node, object]).isRequired,
  routing: shape({
    otherRoutes: arrayOf(shape({
      path: string.isRequired,
      exact: boolean,
      component: oneOfType([func, node, object]).isRequired,
    })),
    currentRoute: shape({
      path: string.isRequired,
      exact: boolean,
      history: object,
      route: string.isRequired,
    }),
  }),
  componentProps: object,
}

export { MockRouter }