import React from 'react'
import type { RenderResult as TLRenderResult } from '@testing-library/react'

export type HttpMethod = UpperCaseHttpMethod | Lowercase<UpperCaseHttpMethod>

type UpperCaseHttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD'
  | 'CONNECT'
  | 'TRACE'

export interface WrapRequest extends Partial<Request> {
  _bodyInit?: string
  url: string
}

export interface RequestOptions {
  host?: string
  body?: object | string
  method?: HttpMethod
}

export interface WrapResponse extends Partial<Response> {
  /** The call's path we want to mock */
  path: string
  /** To which host the call corresponds to */
  host?: string
  /** The HTTP method we should intercept, defaults to GET */
  method?: HttpMethod
  /** The response for this call */
  responseBody?: object | string
  /** The request to match with the responseBody for this call */
  requestBody?: object
  /** Allows to return multiple response for a call */
  multipleResponses?: Array<Partial<WrapResponse>>
  catchParams?: boolean
  delay?: number
  hasBeenReturned?: boolean
}

export type NetworkResponses = WrapResponse | WrapResponse[]

export interface Wrap {
  withNetwork: (responses?: NetworkResponses) => Wrap
  atPath: (path: string, historyState?: object) => Wrap
  withProps: (props: object) => Wrap
  debugRequests: () => Wrap
  mount: () => RenderResult
}

export interface WrapOptions {
  Component: unknown
  responses: WrapResponse[]
  props: object
  path: string
  historyState?: object
  hasPath: boolean
  debug: boolean
}

export interface WrapExtensionAPI {
  addResponses: (responses: Array<WrapResponse>) => unknown
}

type Extension = <T>(extensionAPI: WrapExtensionAPI, args: T) => Wrap

type Extensions = {
  [key: string]: Extension
}

type Component = React.ReactElement<any, any>

export type RenderResult = TLRenderResult | HTMLDivElement
export type Mount = (component: Component) => RenderResult

export interface Config {
  defaultHost: string
  mount: Mount
  extend: Extensions
  changeRoute: (path: string) => void
  history?: BrowserHistory
  portal?: string
  portals?: string[]
  handleQueryParams?: boolean
}

interface BrowserHistory extends History {
  push: (path: string, historyState?: object) => void
}

export {
  WrapResponse as Response,
  Component,
  BrowserHistory,
  Extension,
  Extensions,
}
