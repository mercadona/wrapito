import React from 'react'

interface WrapRequest extends Request {
  _bodyInit?: string
}

interface WrapResponse extends Response {
  path: string
  method?: string
  host?: string
  responseBody?: object
  requestBody?: object
  multipleResponses?: WrapResponse[]
  catchParams?: boolean
  delay?: number
  hasBeenReturned?: boolean
}

interface Wrap {
  withNetwork: (responses: WrapResponse[]) => Wrap
  atPath: (path: string, state: object) => Wrap
  withProps: (props: object) => Wrap
  debugRequests: () => Wrap
  mount: () => object
}

interface WrapOptions {
  Component: typeof React.Component
  responses: WrapResponse[]
  props: object
  path: string
  state?: object
  hasPath: boolean
  debug: boolean
}

interface WrapExtensionAPI {
  addResponses: (responses: WrapResponse[]) => void
}

type Extension = <T>(extensionAPI: WrapExtensionAPI, args: T) => Wrap

type Extensions = {
  [key: string]: Extension
}

type Component = React.ReactElement<any, any>

type Mount = (component: Component) => HTMLDivElement

interface Config {
  defaultHost: string
  mount: Mount
  extend: Extensions
  changeRoute: (path: string) => void
  history?: BrowserHistory
  portal?: string
}

interface BrowserHistory extends History {
  push: (path: string, state?: object) => void
}

export {
  WrapRequest,
  WrapResponse as Response,
  Config,
  Mount,
  Component,
  BrowserHistory,
  Extension,
  Extensions,
  WrapExtensionAPI,
  Wrap,
  WrapOptions,
}
