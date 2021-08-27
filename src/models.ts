import React from 'react'

interface Response {
  path: string
  method?: string
  status?: number
  host?: string
  responseBody?: object
  requestBody?: object
  multipleResponses?: Response[]
  catchParams?: boolean
  delay?: number
}

interface Wrap {
  withNetwork: (responses: Response[]) => Wrap
  atPath: (path: string) => Wrap
  withProps: (props: object) => Wrap
  debugRequests: () => Wrap
  mount: () => object
}

interface WrapOptions {
  Component: typeof React.Component
  responses: Response[]
  props: object
  path: string
  hasPath: boolean
  debug: boolean
}

interface WrapExtensionAPI {
  addResponses: () => void
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
  portal?: string
}

export { Wrap, WrapOptions, Response, Config, Mount, Component }
